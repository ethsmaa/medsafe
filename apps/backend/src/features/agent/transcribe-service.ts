/**
 * Audio transcription service using Gemini.
 * Converts base64-encoded audio to text.
 */
import { GEMINI_MODEL } from "../medication/prompts.js";
import { getGeminiClient } from "./gemini-client.js";

/** ~6 MB base64 ≈ 4.5 MB raw audio (≈ 5 min at 64 kbps mono AAC). */
const MAX_AUDIO_BASE64_LENGTH = 6_000_000;

/**
 * Transcribes base64-encoded audio to text using Gemini.
 * @param audioBase64 - Base64-encoded audio (mp4/m4a from expo-av).
 * @param language - "tr" for Turkish, "en" for English.
 * @returns The transcribed text (empty string if unclear).
 */
export async function transcribeAudio(
	audioBase64: string,
	language: string,
): Promise<string> {
	if (audioBase64.length > MAX_AUDIO_BASE64_LENGTH) {
		throw new Error(
			language === "tr"
				? "Ses kaydı çok uzun. Lütfen daha kısa konuşun."
				: "Audio recording is too long. Please speak a shorter message.",
		);
	}

	const model = getGeminiClient().getGenerativeModel({ model: GEMINI_MODEL });

	const languageHint =
		language === "tr"
			? "Türkçe konuşma. Metni Türkçe olarak yaz."
			: "English speech. Write the text in English.";

	const result = await model.generateContent([
		{
			inlineData: {
				mimeType: "audio/mp4",
				data: audioBase64,
			},
		},
		{
			text: `Transcribe this audio recording to text. ${languageHint}
Return ONLY the transcribed text, nothing else. No quotes, no explanations.
If the audio is empty or unclear, return an empty string.`,
		},
	]);

	const text = result.response.text().trim();
	return text.replace(/^["'`]+|["'`]+$/g, "");
}
