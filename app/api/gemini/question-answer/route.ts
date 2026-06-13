import { NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";
import { checkAndRecordUsage, getClientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, userId } = body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        { success: false, error: "Question is required" },
        { status: 400 }
      );
    }

    /* ───── Rate limiting ───── */
    const identifier = userId || getClientIp(req);
    const identifierType = userId ? "user" : "ip";

    const usage = await checkAndRecordUsage(identifier, identifierType, "predict");
    if (!usage.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "limit_reached",
          message: "Daily AI request limit reached.",
        },
        { status: 429 }
      );
    }

    /* ───── Generate answer ───── */
    const prompt = `
You are a helpful engineering exam tutor.

A student has asked you to explain how to approach the following exam question:

"${question}"

Provide a clear, well-structured explanation that helps the student understand the CONCEPT and how to approach answering it — not just a copy-paste answer to memorize.

Structure your response with:
- A brief explanation of the core concept
- Key points or steps to cover in the answer
- Any relevant diagrams/formulas described in words (since this is plain text)
- Common mistakes to avoid

Keep it concise but thorough. Plain text only, no markdown formatting (no #, *, or **).
`.trim();

    const result = await geminiModel.generateContent(prompt);
    const answer = result.response.text().trim();

    return NextResponse.json({
      success: true,
      answer,
      remaining: usage.remaining,
    });
  } catch (error) {
    console.error("question-answer error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to generate answer" },
      { status: 500 }
    );
  }
}
