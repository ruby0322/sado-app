"use client";
import { useRef, useState } from "react";
import type { DragEvent, ChangeEvent } from "react";
import type { QuestionCount } from "@/app/types";

interface UploadZoneProps {
  onGenerate: (file: File, count: QuestionCount) => void;
}

function validateFile(file: File): string {
  const name = file.name.toLowerCase();
  if (!name.endsWith(".pdf") && !name.endsWith(".pptx")) return "只支援 PDF 或 PPTX 檔案";
  if (file.size > 10 * 1024 * 1024) return "檔案大小不能超過 10MB";
  return "";
}

export default function UploadZone({ onGenerate }: UploadZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [count, setCount] = useState<QuestionCount>(10);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    const err = validateFile(f);
    if (err) { setError(err); return; }
    setError("");
    setFile(f);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  return (
    <div className="space-y-6">
      <div
        onDrop={onDrop}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
          ${dragOver
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.pptx"
          className="hidden"
          onChange={onChange}
        />
        <div className="text-4xl mb-3">📄</div>
        {file ? (
          <p className="font-semibold text-indigo-700">{file.name}</p>
        ) : (
          <>
            <p className="text-gray-600 font-medium">拖曳 PDF / PPTX 到這裡</p>
            <p className="text-gray-400 text-sm mt-1">或點擊選擇檔案（最大 10MB）</p>
          </>
        )}
      </div>

      {error && (
        <p className="text-rose-500 text-sm text-center">{error}</p>
      )}

      <div>
        <p className="text-sm text-gray-500 text-center mb-3">選擇題數</p>
        <div className="flex justify-center gap-3">
          {([5, 10, 20] as QuestionCount[]).map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setCount(n)}
              className={`px-6 py-2 rounded-xl font-semibold transition-all
                ${count === n
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {n} 題
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => file && onGenerate(file, count)}
        disabled={!file}
        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white
          font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg
          disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        開始生成考題
      </button>
    </div>
  );
}
