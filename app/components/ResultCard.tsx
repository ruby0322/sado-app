import type { Question, OptionKey } from "@/app/types";

interface ResultCardProps {
  question: Question;
  index: number;
  selected: OptionKey | null;
}

export default function ResultCard({ question, index, selected }: ResultCardProps) {
  const isCorrect = selected === question.answer;

  return (
    <div className={`rounded-2xl border-2 p-6 transition-all
      ${isCorrect ? "border-green-200 bg-green-50" : "border-rose-200 bg-rose-50"}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{isCorrect ? "✅" : "❌"}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 leading-relaxed">
            <span className="text-gray-400 mr-2">Q{index + 1}.</span>
            {question.question}
          </p>
          {!isCorrect && (
            <p className="text-rose-600 text-sm mt-1">
              你選了 <strong>{selected ?? "（未作答）"}</strong>，
              正確答案是 <strong>{question.answer}</strong>
              {" — "}{question.options[question.answer]}
            </p>
          )}
          <div className="mt-3 bg-white/70 rounded-xl p-3 border border-amber-200">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-amber-600">💡 解析：</span>
              {question.explanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
