"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");

  function addTodo() {
    const text = input.trim();
    if (!text) return;
    setTodos([...todos, { id: Date.now(), text, done: false }]);
    setInput("");
    toast.success("Todo added!");
  }

  function toggleTodo(id: number) {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    const todo = todos.find(t => t.id === id);
    if (todo) {
      toast(todo.done ? "Todo marked as incomplete" : "Todo completed!", { icon: todo.done ? "↩️" : "✅" });
    }
  }

  function deleteTodo(id: number) {
    setTodos(todos.filter((t) => t.id !== id));
    toast.error("Todo deleted!");
  }

  return (
    <main className="max-w-md mx-auto mt-16 px-4 font-sans">
      <h1 className="text-2xl font-bold mb-6">SADo App</h1>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          placeholder="What needs to be done?"
          className="flex-1 px-3 py-2 text-base border border-gray-300"
        />
        <button onClick={addTodo} className="px-4 py-2 text-base border border-gray-300">
          Add
        </button>
      </div>

      {todos.length === 0 && <p className="text-gray-400">No todos yet.</p>}

      <ul className="list-none p-0 m-0">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center gap-2 py-2 border-b border-gray-100"
          >
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggleTodo(todo.id)}
            />
            <span className={`flex-1 ${todo.done ? "line-through text-gray-400" : ""}`}>
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)} className="text-xs px-2 py-1 border border-gray-300">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
