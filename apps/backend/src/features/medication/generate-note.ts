import { getGeminiClient } from "../agent/gemini-client.js";
import {
	AI_NOTE_SYSTEM_PROMPT,
	buildAiNoteUserPrompt,
	GEMINI_MODEL,
} from "./prompts.js";

export type NoteSource = "fda" | "ai_only";

export interface GeneratedNote {
	note: string;
	source: NoteSource;
}

// ─── OpenFDA ──────────────────────────────────────────────────────────────────

const OPENFDA_BASE = "https://api.fda.gov/drug/label.json";

/**
 * Fetches drug label info from OpenFDA.
 * Prefers indications_and_usage, falls back to dosage_and_administration.
 * Returns null when no match is found or the API is unreachable.
 */
export async function fetchDrugInfo(drugName: string): Promise<string | null> {
	try {
		const query = encodeURIComponent(`"${drugName}"`);
		const url = `${OPENFDA_BASE}?search=openfda.brand_name:${query}+openfda.generic_name:${query}&limit=1`;

		const response = await fetch(url, {
			signal: AbortSignal.timeout(6_000), // 6 s hard limit
		});

		if (!response.ok) return null;

		const data = (await response.json()) as {
			results?: Array<{
				indications_and_usage?: string[];
				dosage_and_administration?: string[];
			}>;
		};

		const label = data.results?.[0];
		if (!label) return null;

		const text =
			label.indications_and_usage?.[0] ??
			label.dosage_and_administration?.[0] ??
			null;

		return text;
	} catch {
		// Network error, timeout, or JSON parse failure — degrade gracefully
		return null;
	}
}

// ─── Gemini AI ────────────────────────────────────────────────────────────────

/**
 * Generates an elderly-friendly 3-bullet medication note in the requested language.
 * Attempts to enrich with OpenFDA data; falls back to AI-only if unavailable.
 *
 * @throws Error when the Gemini API key is missing or the AI call fails.
 */
export async function generateMedicationNote(
	drugName: string,
	language = "en",
): Promise<GeneratedNote> {
	// 1. Try to get enriched FDA text
	const fdaText = await fetchDrugInfo(drugName);
	const source: NoteSource = fdaText ? "fda" : "ai_only";

	// 2. Call Gemini with system + user prompt
	const model = getGeminiClient().getGenerativeModel({
		model: GEMINI_MODEL,
		systemInstruction: AI_NOTE_SYSTEM_PROMPT,
	});

	const userPrompt = buildAiNoteUserPrompt(drugName, fdaText, language);
	const result = await model.generateContent(userPrompt);
	const note = result.response.text().trim();

	if (!note) {
		throw new Error("AI did not return a medication note. Please try again.");
	}

	return { note, source };
}
