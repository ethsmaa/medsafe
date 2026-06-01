import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import {
	MEAL_STATUSES,
	MEDICATION_FORMS,
	MEDICATION_FREQUENCIES,
} from "./constants.js";
import { GEMINI_MODEL, SCAN_MEDICATION_PROMPT } from "./prompts.js";

// Zod schema for the structured scan result
const ScanResultSchema = z.object({
	nameGeneric: z.string().nullable(),
	nameBrand: z.string().nullable(),
	dosageAmount: z.string().nullable(),
	form: z.enum(MEDICATION_FORMS).nullable(),
	frequency: z.enum(MEDICATION_FREQUENCIES).nullable(),
	dailyDoseCount: z.number().min(1).max(12).default(1),
	mealStatus: z.enum(MEAL_STATUSES).nullable(),
	instructions: z.string().nullable(),
	confidence: z.number().min(0).max(100),
});

export type ScanResult = z.infer<typeof ScanResultSchema>;

export async function scanMedicationImage(
	imageBase64: string,
): Promise<ScanResult> {
	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) {
		throw new Error(
			"GEMINI_API_KEY is not set. Add it to your .env.development file.",
		);
	}

	const genAI = new GoogleGenerativeAI(apiKey);
	const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

	// Strip data URI prefix if present
	const base64Data = imageBase64.includes(",")
		? (imageBase64.split(",")[1] ?? imageBase64)
		: imageBase64;

	const result = await model.generateContent([
		SCAN_MEDICATION_PROMPT,
		{
			inlineData: {
				mimeType: "image/jpeg",
				data: base64Data,
			},
		},
	]);

	const responseText = result.response.text().trim();

	// Parse JSON from response (handle potential markdown wrapping)
	let jsonStr = responseText;
	if (jsonStr.startsWith("```")) {
		jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
	}

	try {
		const parsed = JSON.parse(jsonStr);
		return ScanResultSchema.parse(parsed);
	} catch {
		// Gemini response was not valid JSON
		throw new Error(
			"Could not extract medication info from this image. Please try again with a clearer photo.",
		);
	}
}
