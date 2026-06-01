import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc/index.js";
import { resolveTargetPatient } from "../medication/resolve-patient.js";
import { agentChat } from "./agent-service.js";
import { transcribeAudio } from "./transcribe-service.js";
import { ChatInputSchema } from "./types.js";

const MESSAGES = {
	tr: {
		profileMissing: "Hasta profili bulunamadı. Lütfen önce profilinizi oluşturun.",
		chatFailed: "Asistan şu anda yanıt veremiyor. Lütfen tekrar deneyin.",
		transcribeFailed: "Ses tanıma başarısız oldu.",
	},
	en: {
		profileMissing: "Patient profile not found. Please create your profile first.",
		chatFailed: "The assistant cannot respond right now. Please try again.",
		transcribeFailed: "Voice transcription failed.",
	},
} as const;

function pickMessages(lang: string) {
	return lang === "en" ? MESSAGES.en : MESSAGES.tr;
}

export const agentRouter = router({
	/**
	 * Chat with the MedSafe AI health assistant.
	 * Uses Gemini Function Calling to query the patient's medication data.
	 */
	chat: protectedProcedure
		.input(ChatInputSchema)
		.mutation(async ({ ctx, input }) => {
			const { message, conversationHistory, language } = input;
			const msgs = pickMessages(language);

			let patientId: string;
			try {
				patientId = await resolveTargetPatient(ctx.user.id, undefined, {
					autoCreate: true,
				});
			} catch {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: msgs.profileMissing,
				});
			}

			try {
				return await agentChat(message, patientId, language, conversationHistory);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: error instanceof Error ? error.message : msgs.chatFailed,
				});
			}
		}),

	/**
	 * Transcribe audio to text using Gemini.
	 * Accepts base64-encoded audio and returns the transcription.
	 */
	transcribe: protectedProcedure
		.input(
			z.object({
				audioBase64: z.string().min(1, "Ses verisi boş olamaz"),
				language: z.enum(["tr", "en"]).default("tr"),
			}),
		)
		.mutation(async ({ input }) => {
			const msgs = pickMessages(input.language);
			try {
				const text = await transcribeAudio(input.audioBase64, input.language);
				return { text };
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: error instanceof Error ? error.message : msgs.transcribeFailed,
				});
			}
		}),
});

