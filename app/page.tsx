"use client";
import { useState, useRef } from "react";
import UploadZone from "@/app/components/UploadZone";
import QuizCard from "@/app/components/QuizCard";
import ResultCard from "@/app/components/ResultCard";
import type { Question, AppState, OptionKey, QuestionCount } from "@/app/types";

function scoreLabel(score: number, total: number): string {
  if (score === total) return "全對！太厲害了！";
  if (score >= total * 0.8) return "很不錯！繼續保持！";
  if (score >= total * 0.6) return "還不錯，再努力一點！";
  return "繼續加油！";
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>("upload");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, OptionKey>>({});
  const [apiError, setApiError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  async function handleGenerate(file: File, count: QuestionCount) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setApiError("");
    setAppState("loading");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("count", count.toString());

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error ?? "生成失敗，請重試");
        setAppState("upload");
        return;
      }

      if (!data.questions || data.questions.length === 0) {
        setApiError("生成失敗：未取得任何題目");
        setAppState("upload");
        return;
      }

      setQuestions(data.questions);
      setAnswers({});
      setAppState("quiz");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setApiError("網路錯誤，請重試");
      setAppState("upload");
    }
  }

  function handleSelect(questionId: number, key: OptionKey) {
    setAnswers(prev => ({ ...prev, [questionId]: key }));
  }

  function handleReset() {
    abortRef.current?.abort();
    setQuestions([]);
    setAnswers({});
    setApiError("");
    setAppState("upload");
  }

  const answeredCount = Object.keys(answers).length;
  const score = questions.filter(q => answers[q.id] === q.answer).length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center gap-3 mb-8">
          <div className="bg-indigo-600 w-2 h-8 rounded-full" />
          <h1 className="text-3xl font-black tracking-tight text-indigo-900">
            模擬考題生成器
            <span className="text-sm font-normal text-indigo-400 ml-2">AI Powered</span>
          </h1>
        </header>

        {appState === "upload" && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {apiError && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
                {apiError}
              </div>
            )}
            <UploadZone onGenerate={handleGenerate} />
          </div>
        )}

        {appState === "loading" && (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-100">
            <div className="text-5xl mb-4 animate-bounce">✨</div>
            <p className="text-lg font-semibold text-indigo-700">
              AI 正在根據你的文件生成考題...
            </p>
            <p className="text-gray-400 text-sm mt-2">這可能需要 10–30 秒</p>
          </div>
        )}

        {appState === "quiz" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 flex justify-between items-center sticky top-4 z-10">
              <span className="text-sm text-gray-500">
                已作答{" "}
                <strong className="text-indigo-600">{answeredCount}</strong>
                {" / "}{questions.length}
              </span>
              <button
                type="button"
                onClick={() => setAppState("results")}
                disabled={answeredCount < questions.length}
                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-xl
                  hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                交卷
              </button>
            </div>

            {questions.map((q, i) => (
              <QuizCard
                key={q.id}
                question={q}
                index={i}
                selected={answers[q.id] ?? null}
                onSelect={key => handleSelect(q.id, key)}
              />
            ))}

            <div className="flex justify-center py-4">
              <button
                type="button"
                onClick={() => setAppState("results")}
                disabled={answeredCount < questions.length}
                className="px-10 py-4 bg-indigo-600 text-white font-bold rounded-xl
                  hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed
                  transition-all shadow-lg"
              >
                交卷
              </button>
            </div>
          </div>
        )}

        {appState === "results" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
              <div className="text-5xl mb-3">🎉</div>
              <p className="text-4xl font-black text-indigo-900">
                {score}
                <span className="text-xl font-normal text-gray-400 ml-1">
                  / {questions.length} 分
                </span>
              </p>
              <p className="text-gray-500 mt-2">{scoreLabel(score, questions.length)}</p>
            </div>

            {questions.map((q, i) => (
              <ResultCard
                key={q.id}
                question={q}
                index={i}
                selected={answers[q.id] ?? null}
              />
            ))}

            <div className="flex justify-center py-4">
              <button
                type="button"
                onClick={handleReset}
                className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600
                  text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
              >
                重新上傳
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
