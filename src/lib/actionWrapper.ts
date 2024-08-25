"use server";
import { randomUUID } from "crypto";
import prisma from "./prisma";
import { actionQueue, actionQueueEvents } from "./actionQueue";

interface ActionResult<T> {
  data?: T;
  queue_id?: string;
}

export const action = async <T>(
  actionName: string,
  params: any,
  isLongRunning = false
): Promise<ActionResult<T>> => {
  const queue_id = randomUUID();

  try {
    const job = await actionQueue.add(
      actionName,
      { queue_id, params, isLongRunning },
      { removeOnComplete: true, removeOnFail: true }
    );

    const jobFinished = job.waitUntilFinished(actionQueueEvents);

    const timeout = new Promise<undefined>(
      (_, reject) => setTimeout(() => reject(new Error("Job timed out")), 2500) // Increased timeout
    );

    const result = await Promise.race([jobFinished, timeout]);

    return { data: result };
  } catch (error) {
    if (error instanceof Error && error.message === "Job timed out") {
      // Return the queue_id if the job times out
      console.error("Job timed out:", queue_id);
      return { queue_id };
    }

    throw error;
  }
};

export const getQueueStatus = async (queue_id: string) => {
  try {
    const queue = await prisma.queue.findUnique({
      where: { queue_id },
    });
    console.log("Queue status:", queue);
    return queue;
  } catch (error) {
    console.error("Error fetching queue status:", error);
    throw new Error("Failed to retrieve queue status");
  }
};
