"use server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { action } from "@/lib/actionWrapper";

export async function getTodos() {
  const todos = await prisma.todo.findMany();
  return todos;
}

export async function createTodo(prevState: any, formData: FormData) {
  const title = formData.get("title") as string;

  try {
    const result = await action("createTodo", { title });

    if ("queue_id" in result) {
      return { queue_id: result.queue_id };
    } else if ("data" in result) {
      return { message: "Todo created successfully!" };
    }

    return { message: "Unexpected result" };
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function createLongRunningTodo(
  prevState: any,
  formData: FormData
) {
  const title = formData.get("title") as string;

  try {
    const result = await action("createTodo", { title }, true);

    if ("queue_id" in result) {
      return { queue_id: result.queue_id };
    } else if ("data" in result) {
      return { message: "Todo created successfully!" };
    }

    return { message: "Unexpected result" };
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function deleteTodo(prevState: any, formData: FormData) {
  const payload = {
    id: parseInt(formData.get("id") as string),
  };
  try {
    const result = await action("deleteTodo", payload);

    if ("queue_id" in result) {
      return { queue_id: result.queue_id };
    } else if ("data" in result) {
      revalidatePath("/");
      return { message: "Todo deleted successfully!" };
    }

    return { message: "Unexpected result" };
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function toggleTodo(prevState: any, formData: FormData) {
  const payload = {
    id: parseInt(formData.get("id") as string),
    done: formData.get("done") === "true",
  };
  try {
    const result = await action("toggleTodo", payload);

    if ("queue_id" in result) {
      return { queue_id: result.queue_id };
    } else if ("data" in result) {
      revalidatePath("/");
      return { message: "Todo status updated successfully!" };
    }

    return { message: "Unexpected result" };
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function updateTodo(prevState: any, formData: FormData) {
  const payload = {
    id: parseInt(formData.get("id") as string),
    title: formData.get("title") as string,
  };
  try {
    const result = await action("updateTodo", payload);

    if ("queue_id" in result) {
      return { queue_id: result.queue_id };
    } else if ("data" in result) {
      revalidatePath("/");
      return { message: "Todo updated successfully!" };
    }

    return { message: "Unexpected result" };
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
