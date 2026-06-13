import { geminiModel } from "@/lib/gemini";

/**
 * Extracts all questions from a paper file (image or PDF) using Gemini.
 * @param fileUrl - public URL of the file
 * @param fileType - "image" or "pdf"
 */
export async function extractQuestions(
  fileUrl: string,
  fileType: "image" | "pdf" = "image"
) {
  try {
    const fileResponse = await fetch(fileUrl);

    if (!fileResponse.ok) {
      throw new Error("Failed to download file");
    }

    const fileBuffer = await fileResponse.arrayBuffer();
    const base64Data = Buffer.from(fileBuffer).toString("base64");

    // Determine MIME type based on file type and URL extension
    let mimeType = "image/jpeg";
    if (fileType === "pdf") {
      mimeType = "application/pdf";
    } else {
      const ext = fileUrl.split("?")[0].split(".").pop()?.toLowerCase();
      if (ext === "png") mimeType = "image/png";
      else if (ext === "webp") mimeType = "image/webp";
      else if (ext === "jpg" || ext === "jpeg") mimeType = "image/jpeg";
    }

    const result = await geminiModel.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
      `
You are an engineering exam paper analyzer.

Extract every question visible in this paper.

Rules:
1. Preserve numbering (Q1, Q2, 1a, 1b, etc.)
2. Include OR options exactly as written.
3. Include sub-parts (a, b, c).
4. Plain text only.
5. No markdown formatting.
6. No explanations or commentary — only the extracted questions.
7. If the document has multiple pages, extract questions from ALL pages.
`,
    ]);

    return {
      success: true,
      extractedText: result.response.text(),
    };
  } catch (error) {
    console.error("extractQuestions error:", error);

    return {
      success: false,
      extractedText: "",
    };
  }
}
