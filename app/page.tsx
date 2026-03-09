"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, generateRandomColor } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface Label {
  id: number;
  name: string;
  color: string;
}

interface Todo {
  id: number;
  text: string;
  done: boolean;
  labelIds: number[];
}

const MAX_LABEL_LENGTH = 10;
const MAX_LABELS_PER_TODO = 5;

interface LabelDropdownProps {
  labels: Label[];
  selectedIds: number[];
  onAddLabel: (label: Label) => void;
  onRemoveLabel: (id: number) => void;
  onCreateLabel: (name: string) => Label | null;
  maxLabelCount?: number;
}

function LabelDropdown({
  labels,
  selectedIds,
  onAddLabel,
  onRemoveLabel,
  onCreateLabel,
  maxLabelCount = MAX_LABELS_PER_TODO,
}: LabelDropdownProps) {
  const canAddMore = selectedIds.length < maxLabelCount;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchLower = search.trim().toLowerCase();
  const filteredLabels = searchLower
    ? labels.filter((l) => l.name.toLowerCase().includes(searchLower))
    : labels;
  const canCreate =
    canAddMore &&
    search.trim().length > 0 &&
    !labels.some((l) => l.name.toLowerCase() === searchLower);
  const selectedLabels = labels.filter((l) => selectedIds.includes(l.id));
  const MAX_DISPLAY_CHARS = 20;
  let displayCharCount = 0;
  let displayCount = 0;
  for (const label of selectedLabels) {
    if (displayCharCount + label.name.length > MAX_DISPLAY_CHARS && displayCount > 0) break;
    displayCharCount += label.name.length;
    displayCount++;
  }
  const displayedLabels = selectedLabels.slice(0, displayCount);
  const useCompact = displayCount < selectedLabels.length;

  return (
    <div ref={containerRef} className="relative flex items-center gap-2 shrink-0">
      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {displayedLabels.map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs rounded"
              style={{
                backgroundColor: `${label.color}30`,
                color: label.color,
                borderLeft: `3px solid ${label.color}`,
              }}
            >
              {label.name}
              <button
                type="button"
                onClick={() => onRemoveLabel(label.id)}
                className="ml-0.5 hover:opacity-70"
                aria-label={`Remove ${label.name}`}
              >
                ×
              </button>
            </span>
          ))}
          {useCompact && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-gray-500 cursor-default">
                  +{selectedLabels.length - displayCount} more
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{selectedLabels.map((l) => l.name).join(", ")}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={() => {
          const next = !open;
          if (next) setSearch("");
          setOpen(next);
        }}
        className="text-xs px-2 py-1 border border-gray-300 cursor-pointer shrink-0"
      >
        +
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-10 w-52 bg-white border border-gray-200 shadow-lg rounded py-1 text-black">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search or create..."
            className="w-full px-2 py-1.5 text-sm text-black border-b border-gray-100 outline-none placeholder:text-gray-500"
          />
          <div className="max-h-40 overflow-y-auto text-black">
            {selectedIds.length >= maxLabelCount && (
              <p className="px-2 py-1.5 text-sm text-gray-500">Max {maxLabelCount} labels</p>
            )}
            {canCreate && (
              <button
                type="button"
                onClick={() => {
                  const label = onCreateLabel(search.trim());
                  if (label) {
                    onAddLabel(label);
                    setSearch("");
                  }
                }}
                className="w-full text-left px-2 py-1.5 text-sm text-black hover:bg-gray-100 flex items-center gap-2"
              >
                <span className="text-black">Create new:</span>
                <span className="font-medium">&quot;{search.trim().slice(0, MAX_LABEL_LENGTH)}&quot;</span>
              </button>
            )}
            {filteredLabels.map((label) => {
              const isSelected = selectedIds.includes(label.id);
              return (
                <button
                  key={label.id}
                  type="button"
                  onClick={() =>
                    isSelected ? onRemoveLabel(label.id) : canAddMore && onAddLabel(label)
                  }
                  className={cn(
                    "w-full text-left px-2 py-1.5 text-sm text-black flex items-center gap-2",
                    canAddMore || isSelected ? "hover:bg-gray-100" : "opacity-60 cursor-default"
                  )}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="flex-1 truncate">{label.name}</span>
                  {isSelected && <span className="text-xs text-black">✓</span>}
                </button>
              );
            })}
            {filteredLabels.length === 0 && !canCreate && (
              <p className="px-2 py-2 text-sm text-black">No labels</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type PendingDelete = { type: "label"; id: number; name?: string } | { type: "todo"; id: number; text?: string };

function ConfirmModal({
  pending,
  onConfirm,
  onCancel,
}: {
  pending: PendingDelete | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!pending) return null;
  const isLabel = pending.type === "label";
  const message = isLabel
    ? `Delete label "${pending.name ?? "this label"}"? This will remove it from all todos.`
    : `Delete todo "${pending.text ?? "this item"}"?`;
  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 dark:bg-black/60"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded shadow-lg p-4 max-w-sm w-full mx-4 border border-transparent dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
          Confirm delete
        </h2>
        <p className="text-black dark:text-gray-200 mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3 py-1.5 bg-red-600 dark:bg-red-700 text-white rounded cursor-pointer hover:bg-red-700 dark:hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [input, setInput] = useState("");
  const [filterLabelIds, setFilterLabelIds] = useState<number[]>([]);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  const filteredTodos =
    filterLabelIds.length === 0
      ? todos
      : todos.filter((t) => filterLabelIds.some((id) => t.labelIds.includes(id)));

  function toggleFilterLabel(labelId: number) {
    setFilterLabelIds((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
    );
  }

  function addTodo() {
    const text = input.trim();
    if (!text) return;
    setTodos([...todos, { id: Date.now(), text, done: false, labelIds: [] }]);
    setInput("");
  }

  function toggleTodo(id: number) {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function deleteTodo(id: number) {
    setTodos(todos.filter((t) => t.id !== id));
  }

  function addLabelToTodo(todoId: number, label: Label) {
    setTodos(todos.map((t) => (t.id === todoId && t.labelIds.length < MAX_LABELS_PER_TODO ? { ...t, labelIds: [...t.labelIds, label.id] } : t)));
  }

  function removeLabelFromTodo(todoId: number, labelId: number) {
    setTodos(todos.map((t) => (t.id === todoId ? { ...t, labelIds: t.labelIds.filter((id) => id !== labelId) } : t)));
  }

  function createLabel(name: string): Label | null {
    const trimmed = name.trim().slice(0, MAX_LABEL_LENGTH);
    if (!trimmed) return null;
    const existing = labels.find((l) => l.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;
    const existingColors = labels.map((l) => l.color);
    const label: Label = { id: Date.now(), name: trimmed, color: generateRandomColor(existingColors) };
    setLabels([...labels, label]);
    return label;
  }

  function deleteLabel(labelId: number) {
    setLabels((prev) => prev.filter((l) => l.id !== labelId));
    setTodos((prev) =>
      prev.map((t) => ({ ...t, labelIds: t.labelIds.filter((id) => id !== labelId) }))
    );
    setFilterLabelIds((prev) => prev.filter((id) => id !== labelId));
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    if (pendingDelete.type === "label") {
      // BUG (educational): we should delete pendingDelete.id, but we pass the first label's id so the wrong label gets removed. Fix by using pendingDelete.id.
      const firstLabelId = labels[0]?.id ?? pendingDelete.id;
      deleteLabel(firstLabelId);
    } else {
      deleteTodo(pendingDelete.id);
    }
    setPendingDelete(null);
  }

  return (
    <main className="max-w-md mx-auto mt-16 px-4 font-sans">
      <ConfirmModal
        pending={pendingDelete}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
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

      {labels.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Filter by label</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilterLabelIds([])}
              className={cn(
                "text-xs px-2 py-1 rounded border cursor-pointer",
                filterLabelIds.length === 0
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-black border-gray-300 hover:bg-gray-50"
              )}
            >
              All
            </button>
            {labels.map((label) => {
              const active = filterLabelIds.includes(label.id);
              return (
                <span
                  key={label.id}
                  role="group"
                  className={cn(
                    "text-xs px-2 py-1 rounded border cursor-pointer inline-flex items-center gap-1",
                    !active && "border-transparent"
                  )}
                  style={
                    active
                      ? {
                          backgroundColor: `${label.color}30`,
                          color: label.color,
                          borderColor: label.color,
                          boxShadow: `0 0 0 2px ${label.color}40`,
                        }
                      : {
                          backgroundColor: `${label.color}20`,
                          color: label.color,
                          borderColor: "transparent",
                        }
                  }
                >
                  <button
                    type="button"
                    onClick={() => toggleFilterLabel(label.id)}
                    className="flex items-center gap-1"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: label.color }}
                    />
                    {label.name}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingDelete({ type: "label", id: label.id, name: label.name });
                    }}
                    className="ml-0.5 hover:opacity-70 shrink-0 cursor-pointer"
                    aria-label={`Delete ${label.name}`}
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {todos.length === 0 && <p className="text-gray-400">No todos yet.</p>}
      {todos.length > 0 && filteredTodos.length === 0 && (
        <p className="text-gray-400">No todos match the selected labels.</p>
      )}

      <ul className="list-none p-0 m-0">
        {filteredTodos.map((todo) => (
          <li
            key={todo.id}
            className="py-3 border-b border-gray-100"
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)}
                className="shrink-0"
              />
              <span className={cn("flex-1 min-w-0", todo.done && "line-through text-gray-400")}>
                {todo.text}
              </span>
              <LabelDropdown
                labels={labels}
                selectedIds={todo.labelIds}
                onAddLabel={(label) => addLabelToTodo(todo.id, label)}
                onRemoveLabel={(id) => removeLabelFromTodo(todo.id, id)}
                onCreateLabel={createLabel}
              />
              <button
                onClick={() => setPendingDelete({ type: "todo", id: todo.id, text: todo.text })}
                className="text-xs px-2 py-1 border border-gray-300 shrink-0 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
