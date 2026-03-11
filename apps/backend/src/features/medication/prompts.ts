export const SCAN_MEDICATION_PROMPT = `You are a pharmacist assistant. Analyze this medication box/package image.
Extract the following information and return ONLY valid JSON (no markdown, no code blocks):
{
  "nameGeneric": "generic/active ingredient name (e.g. Parasetamol, Ibuprofen)",
  "nameBrand": "brand name on the box (e.g. Parol, Advil)",
  "dosageAmount": "dosage with unit (e.g. 500 mg, 200 mg/5 ml)",
  "form": one of "TABLET", "CAPSULE", "SYRUP", "CREAM", "INJECTION", "OTHER",
  "frequency": one of "DAILY", "WEEKLY", "AS_NEEDED", "PERIODIC",
  "dailyDoseCount": number of doses per day (e.g. if "günde 3 kez" or "3x1" → 3, if "günde 2 kez" or "2x1" → 2, default 1 if not specified),
  "mealStatus": one of "BEFORE_MEAL", "AFTER_MEAL", "WITH_FOOD", "ANY" — detect from phrases like "aç karnına" / "tok karnına" / "yemeklerden önce" / "yemeklerden sonra" / "yemekle birlikte",
  "instructions": "any usage instructions visible on the box, or null",
  "confidence": a number 0-100 indicating how confident you are in the extraction
}
Rules:
- If you cannot read or determine a field, set it to null (except dailyDoseCount which defaults to 1).
- Focus on Turkish medication packaging if the text appears to be in Turkish.
- "aç karnına" = BEFORE_MEAL, "tok karnına" or "yemeklerden sonra" = AFTER_MEAL, "yemekle birlikte" = WITH_FOOD
- For dailyDoseCount, look for patterns like "günde X kez", "X x 1", "1 x X", or "X times daily"
Respond ONLY with the JSON object, nothing else.`;

export const GEMINI_MODEL = "gemini-2.5-flash";

/**
 * System prompt for AI-powered medication note generation.
 * Language is injected at call time via buildAiNoteUserPrompt.
 */
export const AI_NOTE_SYSTEM_PROMPT = `You are a health assistant that simplifies medication prospectus information for elderly patients and their caregivers.
Your task: Take the given technical medication information (or drug name) and produce a concise 3-bullet note.

Rules:
- Each bullet MUST be at most 20 words (60-word total limit)
- Use plain everyday language — no medical jargon
- If unsure about a fact, say "Consult your doctor" instead of guessing
- Reply with ONLY the 3 lines below and absolutely nothing else
- The language of your response MUST match the language specified in the user prompt

Format (output these exact 3 lines and nothing else):
\uD83D\uDCCC How to Use: [usage instructions]
\u26A0\uFE0F Important Warnings: [key warnings]
\uD83D\uDCA1 Small Note: [useful tip or additional info]`;

/**
 * Builds the user-turn prompt for the AI note generation.
 * @param drugName - Brand or generic name of the medication
 * @param fdaText - Raw text from OpenFDA (indications or dosage), or null if unavailable
 * @param language - "tr" for Turkish, "en" for English
 */
export function buildAiNoteUserPrompt(drugName: string, fdaText: string | null, language: string): string {
	const langInstruction = language === "tr"
		? "IMPORTANT: Write your entire response in Turkish (Türkçe)."
		: "IMPORTANT: Write your entire response in English.";

	if (fdaText) {
		return `Drug Name: ${drugName}\n\nProspectus Information:\n${fdaText.slice(0, 3000)}\n\nGenerate the 3-bullet note based on the prospectus above.\n${langInstruction}`;
	}
	return `Drug Name: ${drugName}\n\nGenerate the 3-bullet note based on your general medical knowledge about this medication.\nFor anything uncertain, write "Consult your doctor."\n${langInstruction}`;
}
