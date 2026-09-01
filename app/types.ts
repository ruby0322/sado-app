export interface Question {
  id: number;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  answer: "A" | "B" | "C" | "D";
  explanation: string;
}

export type AppState = "upload" | "loading" | "quiz" | "results";
export type QuestionCount = 5 | 10 | 20;
export type OptionKey = "A" | "B" | "C" | "D";
