import {
	GoogleGenerativeAI,
	type Content,
	type Part,
	type FunctionCall,
} from "@google/generative-ai";
import { GEMINI_MODEL } from "../medication/prompts.js";
import { buildSystemPrompt } from "./system-prompt.js";
import { agentTools } from "./tools.js";
import { dispatchToolCall } from "./tool-handlers.js";
import type { ChatMessage, ChatOutput } from "./types.js";

const MAX_TOOL_ITERATIONS = 5;

/**
 * Converts our ChatMessage[] history to Gemini's Content[] format.
 */
function buildGeminiHistory(conversationHistory: ChatMessage[]): Content[] {
	return conversationHistory.map((msg) => ({
		role: msg.role === "user" ? "user" : "model",
		parts: [{ text: msg.content }],
	}));
}

/**
 * Main agent chat function using Gemini Function Calling with ReAct pattern.
 *
 * Flow:
 * 1. User message + system prompt + tools → Gemini
 * 2. If Gemini returns function_call → dispatch tool handler
 * 3. Feed tool result back to Gemini
 * 4. Repeat until Gemini returns text (max iterations for safety)
 */
export async function agentChat(
	userMessage: string,
	patientId: string,
	language: string,
	conversationHistory: ChatMessage[],
): Promise<ChatOutput> {
	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) {
		throw new Error("GEMINI_API_KEY is not set. Add it to your .env.development file.");
	}

	const genAI = new GoogleGenerativeAI(apiKey);
	const model = genAI.getGenerativeModel({
		model: GEMINI_MODEL,
		systemInstruction: buildSystemPrompt(language),
		tools: agentTools,
	});

	// Start chat with existing history
	const chat = model.startChat({
		history: buildGeminiHistory(conversationHistory),
	});

	// Send user message
	let result = await chat.sendMessage(userMessage);
	let response = result.response;

	// ReAct loop: keep iterating while Gemini requests tool calls
	for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
		const candidate = response.candidates?.[0];
		if (!candidate) break;

		const functionCalls = extractFunctionCalls(candidate.content.parts);
		if (functionCalls.length === 0) break;

		// Execute all requested tool calls
		const toolResponses: Part[] = [];

		for (const fc of functionCalls) {
			const toolResult = await dispatchToolCall(
				fc.name,
				(fc.args as Record<string, unknown>) ?? {},
				patientId,
			);

			toolResponses.push({
				functionResponse: {
					name: fc.name,
					response: toolResult,
				},
			});
		}

		// Feed tool results back to Gemini
		result = await chat.sendMessage(toolResponses);
		response = result.response;
	}

	const replyText = response.text().trim();

	if (!replyText) {
		const fallback =
			language === "tr"
				? "Üzgünüm, şu anda yanıt oluşturamadım. Lütfen tekrar deneyin."
				: "Sorry, I couldn't generate a response. Please try again.";

		return {
			reply: fallback,
			timestamp: new Date().toISOString(),
		};
	}

	return {
		reply: replyText,
		timestamp: new Date().toISOString(),
	};
}

/**
 * Extracts function calls from Gemini response parts.
 */
function extractFunctionCalls(parts: Part[]): FunctionCall[] {
	const functionCalls: FunctionCall[] = [];

	for (const part of parts) {
		if (part.functionCall) {
			functionCalls.push(part.functionCall);
		}
	}

	return functionCalls;
}
