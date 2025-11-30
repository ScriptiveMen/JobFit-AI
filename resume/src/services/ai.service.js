import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../config/config.js";

const genAI = new GoogleGenerativeAI(config.GOOGLE_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
});

export async function analyzeResumeFile(file) {
    const base64Data = file.buffer.toString("base64");

    const prompt = `
You are an expert ATS (Applicant Tracking System) resume reviewer.
You will receive a resume file (PDF or DOCX).

Analyze it and respond ONLY with a valid JSON object in this exact shape:

{
  "atsScore": number (0-100),
  "issues": [
    { "type": string, "message": string }
  ],
  "suggestions": [string],
  "extractedSkills": [string]
}

Important:
- Do NOT wrap the JSON in backticks.
- Do NOT use Markdown.
- Respond with ONLY the JSON object.
`;

    const result = await model.generateContent([
        { text: prompt },
        {
            inlineData: {
                data: base64Data,
                mimeType: file.mimetype,
            },
        },
    ]);

    const rawText = result.response.text();

    // 1) remove ```json and ``` if they exist
    const cleaned = rawText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    // 2) extra safety: take only the part between the first { and last }
    const jsonSlice = cleaned.slice(
        cleaned.indexOf("{"),
        cleaned.lastIndexOf("}") + 1
    );

    let parsed;
    try {
        parsed = JSON.parse(jsonSlice);
    } catch (e) {
        console.error("Failed to parse Gemini JSON:", rawText);
        throw new Error("Gemini returned invalid JSON");
    }

    return parsed;
}

export async function getDetails(file) {
    const base64Data = file.buffer.toString("base64");

    const prompt = `
You are an AI assistant helping a recruiter quickly understand a candidate's resume.
You will receive the resume as a file (PDF or DOCX).

Return ONLY a JSON object with this exact structure (no markdown, no backticks):

{
  "candidateOverview": string,
  "keyHighlights": [string],
  "technicalSkills": [string],
  "experienceSummary": string,
  "potentialConcerns": [string],
  "suggestedRoles": [string]
}

Important:
- Do NOT wrap the JSON in backticks.
- Do NOT use Markdown.
- Respond with ONLY the JSON object.
`;

    const result = await model.generateContent([
        { text: prompt },
        {
            inlineData: {
                data: base64Data,
                mimeType: file.mimetype,
            },
        },
    ]);

    const rawText = result.response.text();
    console.log("HR summary raw:", rawText); // keep this while debugging

    // Find the first JSON object in the string: from first "{" to last "}"
    const match = rawText.match(/{[\s\S]*}/);
    if (!match) {
        console.error("No JSON object found in HR summary:", rawText);
        throw new Error("Gemini returned no JSON for HR summary");
    }

    const jsonSlice = match[0];

    try {
        return JSON.parse(jsonSlice);
    } catch (e) {
        console.error("Failed to parse HR summary JSON. Slice was:", jsonSlice);
        throw new Error("Gemini returned invalid JSON for HR summary");
    }
}
