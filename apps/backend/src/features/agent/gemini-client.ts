/**
 * Singleton Gemini client. Lazy-initialised on first use so `GEMINI_API_KEY`
 * absence becomes a runtime error on the first call (not import time).
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

let cached: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
	if (cached) return cached;
	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) {
		throw new Error(
			"GEMINI_API_KEY is not set. Add it to your .env.development file.",
		);
	}
	cached = new GoogleGenerativeAI(apiKey);
	return cached;
}
