"use client";
import { Todo } from "@prisma/client";
import { useState } from "react";
import { deleteTodo, toggleTodo, updateTodo } from "../actions/form";

export function TodoItem({ todo }: { todo: Todo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  return (
    <li
      key={todo.id}
      className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={todo.done}
          className=" checkbox"
          onChange={() => {
            toggleTodo(todo.id, !todo.done);
          }}
        />
        {!isEditing ? (
          <p
            className={`text-lg font-medium
            ${todo.done ? "line-through" : ""}
            `}
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
            <button
              className="btn btn-info"
              onClick={() => {
                setIsEditing(!isEditing);
              }}
            >
              Edit
            </button>
            <button
              className="btn btn-error"
              onClick={() => deleteTodo(todo.id)}
            >
              Delete
            </button>
          </>
        ) : (
          <>
            <button
              className="btn btn-success"
              onClick={() => {
                setIsEditing(!isEditing);
                updateTodo(todo.id, editTitle);
              }}
            >
              Save
            </button>
            <button
              className="btn btn-outline"
              onClick={() => {
                setIsEditing(!isEditing);
                setEditTitle(todo.title);
              }}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </li>
  );
}
