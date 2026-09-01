"use client";
import type { Question, OptionKey } from "@/app/types";

interface QuizCardProps {
  question: Question;
  index: number;
  selected: OptionKey | null;
  onSelect: (key: OptionKey) => void;
}

const OPTIONS: OptionKey[] = ["A", "B", "C", "D"];

export default function QuizCard({ question, index, selected, onSelect }: QuizCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <p className="font-semibold text-slate-800 mb-4 leading-relaxed">
        <span className="text-indigo-500 font-bold mr-2">Q{index + 1}.</span>
        {question.question}
      </p>
      <div className="space-y-2">
        {OPTIONS.map(key => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all
              ${selected === key
                ? "border-indigo-500 bg-indigo-50 text-indigo-800 font-semibold"
                : "border-gray-100 bg-gray-50 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50"}`}
          >
            <span className="font-bold mr-2">{key}.</span>
            {question.options[key]}
          </button>
        ))}
      </div>
    </div>
  );
}
