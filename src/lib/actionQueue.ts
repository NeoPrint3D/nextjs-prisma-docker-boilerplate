import { QUEUE_NAME } from "../constants/queue";
import { Queue, QueueEvents } from "bullmq";

export const actionQueue = new Queue(QUEUE_NAME, {
  connection: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
});

export const actionQueueEvents = new QueueEvents(QUEUE_NAME, {
  connection: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
});
