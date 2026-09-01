import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { extractPdfText, extractPptxText } from "@/app/lib/extractors";
import type { Question } from "@/app/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const countStr = formData.get("count") as string | null;

    if (!file) {
      return NextResponse.json({ error: "請上傳檔案" }, { status: 400 });
    }

    const count = parseInt(countStr ?? "10", 10);
    const name = file.name.toLowerCase();

    if (!name.endsWith(".pdf") && !name.endsWith(".pptx")) {
      return NextResponse.json({ error: "只支援 PDF 或 PPTX 檔案" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "檔案大小不能超過 10MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = name.endsWith(".pdf")
      ? await extractPdfText(buffer)
      : await extractPptxText(buffer);

    if (text.trim().length < 100) {
      return NextResponse.json({ error: "文件內容不足，無法生成考題" }, { status: 400 });
    }

    const prompt = `你是出題老師。根據以下內容，生成 ${count} 道繁體中文四選一選擇題。

規則：
- 每題有四個選項 A、B、C、D
- 必須標明正確答案（只填大寫字母 A/B/C/D）
- 提供一段解析說明（2-3 句，說明為何這個答案正確）
- 題目要考驗對內容的理解，不只是表面記憶

請只回傳純 JSON array，不要有任何 Markdown、程式碼區塊或其他文字：
[{"id":1,"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"answer":"A","explanation":"..."}]

文件內容：
${text.slice(0, 8000)}`;

    const stream = client.messages.stream({
      model: "claude-opus-4-8",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const response = await stream.finalMessage();
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text in response");
    }

    const raw = textBlock.text.trim();
    const jsonStr = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const questions: Question[] = JSON.parse(jsonStr);

    return NextResponse.json({ questions });
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: "AI 生成失敗，請重試" }, { status: 500 });
  }
}
