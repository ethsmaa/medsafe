import { z } from "zod";

// ─── Chat Message ─────────────────────────────────────────────────────────────

export const ChatMessageSchema = z.object({
	role: z.enum(["user", "assistant"]),
	content: z.string(),
	timestamp: z.string(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// ─── Chat Input / Output ──────────────────────────────────────────────────────

export const ChatInputSchema = z.object({
	message: z.string().min(1, "Mesaj boş olamaz"),
	conversationHistory: z.array(ChatMessageSchema).default([]),
	language: z.enum(["tr", "en"]).default("tr"),
});

export type ChatInput = z.infer<typeof ChatInputSchema>;

export type ChatOutput = {
	reply: string;
	timestamp: string;
};

// ─── Tool Handler Results ─────────────────────────────────────────────────────

export type ToolHandlerResult = {
	success: boolean;
	data: unknown;
	error?: string;
};
