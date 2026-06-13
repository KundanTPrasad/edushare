import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { extractQuestions } from "@/lib/ai/extractQuestions";

export async function POST(req: Request) {
  try {
    const { paperId } = await req.json();

    if (!paperId) {
      return NextResponse.json(
        { success: false, error: "paperId required" },
        { status: 400 }
      );
    }

    // Get paper
    const { data: paper, error: paperError } = await supabase
      .from("papers")
      .select("*")
      .eq("id", paperId)
      .single();

    if (paperError || !paper) {
      return NextResponse.json(
        { success: false, error: "Paper not found" },
        { status: 404 }
      );
    }

    // Check if already processed — avoid reprocessing
    const { data: existing } = await supabase
      .from("paper_questions")
      .select("*")
      .eq("paper_id", paper.id)
      .maybeSingle();

    if (existing?.is_processed && existing.processing_status === "completed") {
      return NextResponse.json({
        success: true,
        message: "Already processed",
        extractedText: existing.extracted_text,
      });
    }

    // Create or update processing record
    let questionRowId: string;

    if (existing) {
      questionRowId = existing.id;
      await supabase
        .from("paper_questions")
        .update({ processing_status: "processing", processing_error: null })
        .eq("id", existing.id);
    } else {
      const { data: questionRow, error: createError } = await supabase
        .from("paper_questions")
        .insert({
          paper_id: paper.id,
          subject: paper.subject,
          college: paper.college,
          branch: paper.branch,
          semester: paper.semester,
          year: paper.year,
          extracted_text: "",
          is_processed: false,
          processing_status: "processing",
        })
        .select()
        .single();

      if (createError) throw createError;
      questionRowId = questionRow.id;
    }

    // Extract questions (works for both image and pdf now)
    const fileType: "image" | "pdf" = paper.file_type === "pdf" ? "pdf" : "image";
    const result = await extractQuestions(paper.file_url, fileType);

    if (!result.success || !result.extractedText?.trim()) {
      await supabase
        .from("paper_questions")
        .update({
          processing_status: "failed",
          processing_error: "Gemini extraction failed or returned empty result",
        })
        .eq("id", questionRowId);

      return NextResponse.json(
        { success: false, error: "Question extraction failed" },
        { status: 500 }
      );
    }

    await supabase
      .from("paper_questions")
      .update({
        extracted_text: result.extractedText,
        is_processed: true,
        processing_status: "completed",
        processing_error: null,
      })
      .eq("id", questionRowId);

    return NextResponse.json({
      success: true,
      message: "Paper processed successfully",
      extractedText: result.extractedText,
    });
  } catch (error) {
    console.error("process-paper error:", error);

    return NextResponse.json(
      { success: false, error: "Processing failed" },
      { status: 500 }
    );
  }
}
