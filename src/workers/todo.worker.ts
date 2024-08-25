import { Worker } from "bullmq";
import prisma from "../lib/prisma";
import { QUEUE_NAME } from "../constants/queue";

console.log(process.env.DATABASE_URL);

// Define types for job data
type JobData = {
  queue_id: string;
  params: {
    id?: number;
    title?: string;
    done?: boolean;
  };
  isLongRunning?: boolean;
};

const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const { queue_id, params, isLongRunning } = job.data as JobData;

    console.log(`Processing job ${job.id} with queue_id ${queue_id}`);

    if (isLongRunning) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }

    await prisma.queue.create({
      data: {
        queue_id,
        createdAt: new Date(),
      },
    });

    try {
      let result;

      // Ensure ID is present for operations requiring it
      if (
        ["deleteTodo", "toggleTodo", "updateTodo"].includes(job.name) &&
        !params.id
      ) {
        throw new Error(`Missing todo ID for job ${job.id}`);
      }

      switch (job.name) {
        case "createTodo":
          result = await prisma.todo.create({
            data: {
              title: params.title || "Untitled", // Provide default title if missing
            },
          });
          break;

        case "deleteTodo":
          result = await prisma.todo.delete({
            where: { id: params.id! }, // Use non-null assertion if ID is guaranteed
          });
          break;

        case "toggleTodo":
          result = await prisma.todo.update({
            where: { id: params.id! }, // Use non-null assertion if ID is guaranteed
            data: { done: params.done },
          });
          break;

        case "updateTodo":
          result = await prisma.todo.update({
            where: { id: params.id! }, // Use non-null assertion if ID is guaranteed
            data: { title: params.title },
          });
          break;

        default:
          throw new Error(`Unknown action: ${job.name}`);
      }

      await prisma.queue.update({
        where: { queue_id },
        data: { done: true },
      });

      return result;
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
      if (error instanceof Error) {
        await prisma.queue.update({
          where: { queue_id },
          data: { done: true, error: error.message },
        });
      }

      throw error;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
    },
    concurrency: 1,
  }
);

worker.on("completed", async (job) => {
  console.log(`Job ${job.id} completed with result: ${job.returnvalue}`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed with error:`, err);
});

export default worker;
