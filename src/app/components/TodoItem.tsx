"use client";

import { useState, useEffect, useRef } from "react";
import { deleteTodo, toggleTodo, updateTodo } from "../actions/todo";
import { Todo } from "@prisma/client";
import { toast } from "sonner";
import { getQueueStatus } from "@/lib/actionWrapper";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { POLLING_INTERVAL } from "@/constants/queue";

type TodoState = {
  message?: string;
  queue_id?: string;
};

const initialState: TodoState = {};

function SubmitButton({
  isPending,
  label,
  isDisabled,
  className,
}: {
  isPending: boolean;
  label: string;
  isDisabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={`btn ${className}`}
      disabled={isPending || isDisabled}
    >
      {isPending ? `${label}...` : label}
    </button>
  );
}

export function TodoItem({ todo }: { todo: Todo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [queueId, setQueueId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<
    "delete" | "update" | "toggle" | null
  >(null);

  const router = useRouter();

  const toggleFormRef = useRef<HTMLFormElement>(null);
  const deleteFormRef = useRef<HTMLFormElement>(null);
  const updateFormRef = useRef<HTMLFormElement>(null);

  const [toggleState, toggleFormAction] = useFormState(
    toggleTodo,
    initialState
  );
  const [deleteState, deleteFormAction] = useFormState(
    deleteTodo,
    initialState
  );
  const [updateState, updateFormAction] = useFormState(
    updateTodo,
    initialState
  );

  useEffect(() => {
    const handleState = (
      state: TodoState,
      action: "delete" | "update" | "toggle"
    ) => {
      console.log("State:", state);
      if (state.message) {
        if (action === "update") {
          setIsEditing(false);
        }
        toast.success(state.message);
      }
      if (state.queue_id) {
        setQueueId(state.queue_id);
        setPolling(true);
        setActionInProgress(action);
        toast.info("Action queued. Please wait...");
      }
    };

    if (toggleState.message || toggleState.queue_id) {
      handleState(toggleState, "toggle");
    }
    if (deleteState.message || deleteState.queue_id) {
      handleState(deleteState, "delete");
    }
    if (updateState.message || updateState.queue_id) {
      handleState(updateState, "update");
    }
  }, [toggleState, deleteState, updateState]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const pollQueue = async () => {
      if (queueId) {
        try {
          const status = await getQueueStatus(queueId);
          if (status?.done) {
            setQueueId(null);
            setPolling(false);
            setActionInProgress(null);
            if (status.error) {
              toast.error(status.error);
            } else {
              toast.success("Operation completed successfully!");
              setIsEditing(false);
            }
            router.refresh();
          } else {
            timeoutId = setTimeout(pollQueue, POLLING_INTERVAL);
          }
        } catch (error) {
          toast.error("Failed to check queue status");
          setQueueId(null);
          setPolling(false);
          setActionInProgress(null);
        }
      }
    };

    if (polling) {
      pollQueue();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [queueId, polling]);

  return (
    <li
      key={todo.id}
      className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <form
          action={toggleFormAction}
          ref={toggleFormRef}
          className="flex items-center gap-3"
        >
          <input type="hidden" name="id" value={todo.id} />
          <input
            type="hidden"
            name="done"
            value={todo.done ? "true" : "false"}
          />
          <input
            type="checkbox"
            checked={todo.done}
            className="checkbox"
            onChange={() => toggleFormRef.current?.submit()}
            disabled={
              polling ||
              actionInProgress === "delete" ||
              actionInProgress === "update"
            }
          />
        </form>

        {!isEditing ? (
          <p
            className={`text-lg font-medium ${todo.done ? "line-through" : ""}`}
          >
            {todo.title}
          </p>
        ) : (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="input input-ghost"
          />
        )}
      </div>

      <div className="flex gap-2">
        {!isEditing ? (
          <>
            <form
              action={deleteFormAction}
              ref={deleteFormRef}
              className="inline-block"
            >
              <input type="hidden" name="id" value={todo.id} />
              <button
                type="button"
                className="btn btn-info"
                onClick={() => setIsEditing(true)}
                disabled={
                  polling ||
                  actionInProgress === "delete" ||
                  actionInProgress === "update"
                }
              >
                Edit
              </button>
            </form>

            <form
              action={deleteFormAction}
              ref={deleteFormRef}
              className="inline-block"
            >
              <input type="hidden" name="id" value={todo.id} />
              <SubmitButton
                isPending={polling && actionInProgress === "delete"}
                label="Delete"
                className="btn-error"
                isDisabled={polling && actionInProgress !== "delete"}
              />
            </form>
          </>
        ) : (
          <form
            action={updateFormAction}
            ref={updateFormRef}
            className="flex gap-2"
          >
            <input type="hidden" name="id" value={todo.id} />
            <input type="hidden" name="title" value={editTitle} />
            <SubmitButton
              isPending={polling && actionInProgress === "update"}
              label="Save"
              className="btn-success"
              isDisabled={polling && actionInProgress !== "update"}
            />
            <button
              type="button"
              className="btn btn-outline btn-error"
              onClick={() => {
                setIsEditing(false);
                setEditTitle(todo.title);
              }}
              disabled={polling}
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </li>
  );
}
