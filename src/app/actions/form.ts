"use server";
import { revalidatePath } from "next/cache";
import prisma from "../lib/prisma";
export async function getTodos() {
  const todos = await prisma.todo.findMany();
  return todos;
}

export async function createTodo(formData: FormData) {
  const todo = await prisma.todo.create({
    data: {
      title: formData.get("title") as string,
    },
  });

  // Revalidate the root path to update the todos list
  await revalidatePath("/");

  return todo;
}

export async function deleteTodo(id: number) {
  await prisma.todo.delete({
    where: {
      id,
    },
  });

  // Revalidate the root path to update the todos list
  revalidatePath("/");

  return;
}

export async function toggleTodo(id: number, done: boolean) {
  const todo = await prisma.todo.update({
    where: {
      id,
    },
    data: {
      done,
    },
  });

  // Revalidate the root path to update the todos list
  revalidatePath("/");

  return todo;
}

export async function updateTodo(id: number, title: string) {
  const todo = await prisma.todo.update({
    where: {
      id,
    },
    data: {
      title,
    },
  });

  // Revalidate the root path to update the todos list
  revalidatePath("/");

  return todo;
}
