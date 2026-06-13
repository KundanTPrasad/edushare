import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { geminiModel } from "@/lib/gemini";
import { extractQuestions } from "@/lib/ai/extractQuestions";
import { checkAndRecordUsage, getClientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { college, branch, semester, subject, userId } = body;

    if (!subject) {
      return NextResponse.json(
        { success: false, error: "Subject is required" },
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

    /* ───── Fetch matching papers ───── */
    let query = supabase
      .from("papers")
      .select("*")
      .eq("status", "approved")
      .eq("subject", subject);

    if (college) query = query.eq("college", college);
    if (branch) query = query.eq("branch", branch);
    if (semester) query = query.eq("semester", Number(semester));

    const { data: papers, error } = await query.order("year", { ascending: false });
    if (error) throw error;

    const paperCount = papers?.length || 0;

    if (paperCount === 0) {
      return NextResponse.json({
        success: true,
        prediction: {
          highProbabilityTopics: [],
          mediumProbabilityTopics: [],
          repeatedQuestions: [],
          confidence: "none",
          paperCount: 0,
          message: "No approved papers found for this subject.",
        },
      });
    }

    if (paperCount === 1) {
      return NextResponse.json({
        success: true,
        prediction: {
          highProbabilityTopics: [],
          mediumProbabilityTopics: [],
          repeatedQuestions: [],
          confidence: "very-low",
          paperCount: 1,
          message: "At least 2 papers are required for prediction.",
        },
      });
    }

    let confidence: "low" | "medium" | "high" = "low";
    if (paperCount >= 5) confidence = "high";
    else if (paperCount >= 4) confidence = "medium";

    // Analyze up to 5 most recent papers
    const selectedPapers = papers.slice(0, 5);

    /* ───── Get or generate extracted text for each paper ───── */
    const paperTexts: { year: number; text: string }[] = [];

    for (const paper of selectedPapers) {
      // Check existing extraction
      const { data: existing } = await supabase
        .from("paper_questions")
        .select("*")
        .eq("paper_id", paper.id)
        .maybeSingle();

      if (existing?.is_processed && existing.processing_status === "completed" && existing.extracted_text?.trim()) {
        paperTexts.push({ year: paper.year, text: existing.extracted_text });
        continue;
      }

      // Extract now
      const fileType: "image" | "pdf" = paper.file_type === "pdf" ? "pdf" : "image";
      const result = await extractQuestions(paper.file_url, fileType);

      if (result.success && result.extractedText?.trim()) {
        paperTexts.push({ year: paper.year, text: result.extractedText });

        // Save for future use
        if (existing) {
          await supabase
            .from("paper_questions")
            .update({
              extracted_text: result.extractedText,
              is_processed: true,
              processing_status: "completed",
              processing_error: null,
            })
            .eq("id", existing.id);
        } else {
          await supabase.from("paper_questions").insert({
            paper_id: paper.id,
            subject: paper.subject,
            college: paper.college,
            branch: paper.branch,
            semester: paper.semester,
            year: paper.year,
            extracted_text: result.extractedText,
            is_processed: true,
            processing_status: "completed",
          });
        }
      }
    }

    if (paperTexts.length < 2) {
      return NextResponse.json({
        success: true,
        prediction: {
          highProbabilityTopics: [],
          mediumProbabilityTopics: [],
          repeatedQuestions: [],
          confidence: "very-low",
          paperCount,
          message: "Could not extract enough readable content from the papers to make a prediction.",
        },
      });
    }

    /* ───── Build analysis prompt ───── */
    const papersBlock = paperTexts
      .map((p) => `--- Paper (Year ${p.year}) ---\n${p.text}`)
      .join("\n\n");

    const analysisPrompt = `
You are analyzing ${paperTexts.length} previous year exam papers for the subject "${subject}".

Here are the extracted questions from each paper, labeled by year:

${papersBlock}

Your task: identify patterns across these papers and predict what's likely to appear in the next exam.

Return ONLY a valid JSON object (no markdown, no code fences, no explanation) with this exact structure:

{
  "highProbabilityTopics": [
    { "topic": "Topic name", "count": <number of papers it appeared in> }
  ],
  "mediumProbabilityTopics": [
    { "topic": "Topic name", "count": <number of papers it appeared in> }
  ],
  "repeatedQuestions": [
    { "question": "The exact or paraphrased repeated question", "years": [<years it appeared>], "confidence": "medium" | "high" | "very-high" }
  ]
}

Rules:
- highProbabilityTopics: topics/concepts that appeared in 3+ of the papers
- mediumProbabilityTopics: topics that appeared in exactly 2 papers
- repeatedQuestions: specific questions (or very close variants) that repeated across multiple years
- confidence "very-high" = appeared in 4+ years, "high" = 3 years, "medium" = 2 years
- Limit to top 8 items per array, ordered by relevance
- Topic names should be concise (3-6 words)
- Return ONLY the JSON object, nothing else
`.trim();

    const result = await geminiModel.generateContent(analysisPrompt);
    let responseText = result.response.text().trim();

    // Strip markdown code fences if Gemini adds them despite instructions
    responseText = responseText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("Failed to parse Gemini prediction response:", responseText);
      return NextResponse.json({
        success: true,
        prediction: {
          highProbabilityTopics: [],
          mediumProbabilityTopics: [],
          repeatedQuestions: [],
          confidence,
          paperCount,
          message: "AI analysis completed but response could not be parsed. Try again.",
        },
      });
    }

    return NextResponse.json({
      success: true,
      prediction: {
        highProbabilityTopics: parsed.highProbabilityTopics ?? [],
        mediumProbabilityTopics: parsed.mediumProbabilityTopics ?? [],
        repeatedQuestions: parsed.repeatedQuestions ?? [],
        confidence,
        paperCount,
        analyzedPapers: paperTexts.length,
        remaining: usage.remaining,
      },
    });
  } catch (error) {
    console.error("Prediction Error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to generate prediction" },
      { status: 500 }
    );
  }
}
