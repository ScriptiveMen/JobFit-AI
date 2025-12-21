export function safeJsonParse(text) {
    // Remove ```json ``` or ``` fences
    const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    return JSON.parse(cleaned);
}
