import { getTodos } from "@/app/actions/form";
import { TodoForm } from "@/app/components/TodoForm";
import { TodoItem } from "./components/TodoItem";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center flex-col bg-gray-100 text-gray-800">
      <Suspense
        fallback={
          <div className="text-2xl font-bold text-gray-600">Loading...</div>
        }
      >
        <HomeContent />
      </Suspense>
    </main>
  );
}

async function HomeContent() {
  const todos = await getTodos();
  return (
    <div className="max-w-2xl w-full px-4 py-8">
      <ul className="space-y-4">
        {todos.map((todo) => (
          <TodoItem todo={todo} key={todo.id} />
        ))}
      </ul>
      <TodoForm />
    </div>
  );
}
