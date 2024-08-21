"use client";
import { useRef } from "react";
import { createTodo } from "@/app/actions/form";

export function TodoForm() {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      action={(formData) => {
        createTodo(formData);
        formRef.current?.reset();
      }}
      className="mt-8"
      ref={formRef}
    >
      <input
        type="text"
        name="title"
        placeholder="Enter a todo"
        className="input w-full text-white"
      />
      <button type="submit" className="btn btn-primary w-full mt-5">
        Create
      </button>
    </form>
  );
}
