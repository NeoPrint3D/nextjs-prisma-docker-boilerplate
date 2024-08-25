var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define("lib/prisma", ["require", "exports", "@prisma/client", "@prisma/extension-read-replicas"], function (require, exports, client_1, extension_read_replicas_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let prisma;
    if (process.env.NODE_ENV === "production") {
        prisma = new client_1.PrismaClient().$extends((0, extension_read_replicas_1.readReplicas)({
            url: [process.env.DATABASE_URL_SLAVE1, process.env.DATABASE_URL_SLAVE2],
        }));
    }
    else {
        if (!global.prisma) {
            global.prisma = new client_1.PrismaClient().$extends((0, extension_read_replicas_1.readReplicas)({
                url: [process.env.DATABASE_URL_SLAVE1, process.env.DATABASE_URL_SLAVE2],
            }));
        }
        prisma = global.prisma;
    }
    exports.default = prisma;
});
define("constants/queue", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.POLLING_INTERVAL = exports.QUEUE_NAME = void 0;
    exports.QUEUE_NAME = "action-queue";
    exports.POLLING_INTERVAL = 1000;
});
define("workers/todo.worker", ["require", "exports", "bullmq", "lib/prisma", "constants/queue"], function (require, exports, bullmq_1, prisma_1, queue_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    prisma_1 = __importDefault(prisma_1);
    const worker = new bullmq_1.Worker(queue_1.QUEUE_NAME, async (job) => {
        const { queue_id, params, isLongRunning } = job.data;
        console.log(`Processing job ${job.id} with queue_id ${queue_id}`);
        if (isLongRunning) {
            await new Promise((resolve) => setTimeout(resolve, 10000));
        }
        await prisma_1.default.queue.create({
            data: {
                queue_id,
                createdAt: new Date(),
            },
        });
        try {
            let result;
            // Ensure ID is present for operations requiring it
            if (["deleteTodo", "toggleTodo", "updateTodo"].includes(job.name) &&
                !params.id) {
                throw new Error(`Missing todo ID for job ${job.id}`);
            }
            switch (job.name) {
                case "createTodo":
                    result = await prisma_1.default.todo.create({
                        data: {
                            title: params.title || "Untitled", // Provide default title if missing
                        },
                    });
                    break;
                case "deleteTodo":
                    result = await prisma_1.default.todo.delete({
                        where: { id: params.id }, // Use non-null assertion if ID is guaranteed
                    });
                    break;
                case "toggleTodo":
                    result = await prisma_1.default.todo.update({
                        where: { id: params.id }, // Use non-null assertion if ID is guaranteed
                        data: { done: params.done },
                    });
                    break;
                case "updateTodo":
                    result = await prisma_1.default.todo.update({
                        where: { id: params.id }, // Use non-null assertion if ID is guaranteed
                        data: { title: params.title },
                    });
                    break;
                default:
                    throw new Error(`Unknown action: ${job.name}`);
            }
            await prisma_1.default.queue.update({
                where: { queue_id },
                data: { done: true },
            });
            return result;
        }
        catch (error) {
            console.error(`Error processing job ${job.id}:`, error);
            if (error instanceof Error) {
                await prisma_1.default.queue.update({
                    where: { queue_id },
                    data: { done: true, error: error.message },
                });
            }
            throw error;
        }
    }, {
        connection: {
            host: process.env.REDIS_HOST || "localhost",
            port: parseInt(process.env.REDIS_PORT || "6379", 10),
        },
        concurrency: 1,
    });
    worker.on("completed", async (job) => {
        console.log(`Job ${job.id} completed with result: ${job.returnvalue}`);
    });
    worker.on("failed", (job, err) => {
        console.error(`Job ${job?.id} failed with error:`, err);
    });
    exports.default = worker;
});
define("lib/actionQueue", ["require", "exports", "constants/queue", "bullmq"], function (require, exports, queue_2, bullmq_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.actionQueueEvents = exports.actionQueue = void 0;
    exports.actionQueue = new bullmq_2.Queue(queue_2.QUEUE_NAME, {
        connection: {
            host: process.env.REDIS_HOST || "localhost",
            port: parseInt(process.env.REDIS_PORT || "6379"),
        },
    });
    exports.actionQueueEvents = new bullmq_2.QueueEvents(queue_2.QUEUE_NAME, {
        connection: {
            host: process.env.REDIS_HOST || "localhost",
            port: parseInt(process.env.REDIS_PORT || "6379"),
        },
    });
});
define("lib/actionWrapper", ["require", "exports", "crypto", "lib/prisma", "lib/actionQueue"], function (require, exports, crypto_1, prisma_2, actionQueue_1) {
    "use strict";
    "use server";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getQueueStatus = exports.action = void 0;
    prisma_2 = __importDefault(prisma_2);
    const action = async (actionName, params, isLongRunning = false) => {
        const queue_id = (0, crypto_1.randomUUID)();
        try {
            const job = await actionQueue_1.actionQueue.add(actionName, { queue_id, params, isLongRunning }, { removeOnComplete: true, removeOnFail: true });
            const jobFinished = job.waitUntilFinished(actionQueue_1.actionQueueEvents);
            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Job timed out")), 2500) // Increased timeout
            );
            const result = await Promise.race([jobFinished, timeout]);
            return { data: result };
        }
        catch (error) {
            if (error instanceof Error && error.message === "Job timed out") {
                // Return the queue_id if the job times out
                console.error("Job timed out:", queue_id);
                return { queue_id };
            }
            throw error;
        }
    };
    exports.action = action;
    const getQueueStatus = async (queue_id) => {
        try {
            const queue = await prisma_2.default.queue.findUnique({
                where: { queue_id },
            });
            console.log("Queue status:", queue);
            return queue;
        }
        catch (error) {
            console.error("Error fetching queue status:", error);
            throw new Error("Failed to retrieve queue status");
        }
    };
    exports.getQueueStatus = getQueueStatus;
});
