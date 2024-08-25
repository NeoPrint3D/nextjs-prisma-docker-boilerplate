"use client";

import { useRef, useEffect, useState } from "react";
import { createLongRunningTodo, createTodo } from "@/app/actions/todo";
import { getQueueStatus } from "@/lib/actionWrapper";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useFormStatus, useFormState } from "react-dom";
import { POLLING_INTERVAL } from "@/constants/queue";

type TodoState = {
  message?: string;
  queue_id?: string;
};

const initialState: TodoState = {};

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <button
      type="submit"
      className="btn btn-primary w-full mt-5"
      disabled={isPending}
    >
      {isPending ? "Creating..." : "Create"}
    </button>
  );
}

export function TodoForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [queueId, setQueueId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [currentAction, setCurrentAction] = useState<"normal" | "longRunning">(
    "normal"
  );

  const [todoState, createTodoAction] = useFormState(createTodo, initialState);
  const [longRunningTodoState, createLongRunningTodoAction] = useFormState(
    createLongRunningTodo,
    initialState
  );

  useEffect(() => {
    if (todoState.message || longRunningTodoState.message) {
      toast.success(todoState.message || longRunningTodoState.message);
      formRef.current?.reset();
      router.refresh();
    }

    const state = todoState.queue_id || longRunningTodoState.queue_id;
    if (state) {
      setQueueId(state);
      setPolling(true);
      toast.info("Todo creation queued. Please wait...");
    }
  }, [todoState, longRunningTodoState, router]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const pollQueue = async () => {
      if (queueId) {
        try {
          const status = await getQueueStatus(queueId);
          console.log("Queue status:", status);
          if (status?.done) {
            setQueueId(null);
            setPolling(false);
            if (status.error) {
              toast.error(status.error);
            } else {
              toast.success("Todo created successfully!");
              formRef.current?.reset();
              router.refresh();
            }
          } else {
            timeoutId = setTimeout(pollQueue, POLLING_INTERVAL);
          }
        } catch (error) {
          console.error("Error checking queue status:", error);
          toast.error("Failed to check queue status");
          setQueueId(null);
          setPolling(false);
        }
      }
    };

    if (polling) {
      pollQueue();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [queueId, polling, router]);

  return (
    <>
      {/* Form for Normal Todo */}
      <form
        action={createTodoAction}
        className="mt-8"
        ref={formRef}
        onSubmit={() => setCurrentAction("normal")}
      >
        <input
          type="text"
          name="title"
          placeholder="Enter a todo"
          className="input w-full text-white"
        />
        <SubmitButton isPending={false} />
      </form>

      {/* Form for Long Running Todo */}
      <form
        action={createLongRunningTodoAction}
        className="mt-8"
        ref={formRef}
        onSubmit={() => setCurrentAction("longRunning")}
      >
        <input
          type="text"
          name="title"
          placeholder="Enter a long running todo"
          className="input w-full text-white"
        />
        <SubmitButton isPending={false} />
      </form>
    </>
  );
}
