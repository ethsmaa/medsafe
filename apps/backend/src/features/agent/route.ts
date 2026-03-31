import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc/index.js";
import { resolveTargetPatient } from "../medication/resolve-patient.js";
import { agentChat } from "./agent-service.js";
import { ChatInputSchema } from "./types.js";

export const agentRouter = router({
	/**
	 * Chat with the MedSafe AI health assistant.
	 * Uses Gemini Function Calling to query the patient's medication data.
	 */
	chat: protectedProcedure
		.input(ChatInputSchema)
		.mutation(async ({ ctx, input }) => {
			const { message, conversationHistory, language } = input;

			let patientId: string;
			try {
				patientId = await resolveTargetPatient(ctx.user.id, undefined, { autoCreate: true });
			} catch {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Hasta profili bulunamadı. Lütfen önce profilinizi oluşturun.",
				});
			}

			try {
				const result = await agentChat(message, patientId, language, conversationHistory);
				return result;
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						error instanceof Error
							? error.message
							: "Asistan şu anda yanıt veremiyor. Lütfen tekrar deneyin.",
				});
			}
		}),
});
