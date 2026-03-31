/**
 * Chat store for the MedSafe AI Health Assistant.
 * Uses useState + AsyncStorage for simplicity and reliable re-renders.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "chat_messages";
const MAX_MESSAGES = 50;

export type ChatMessage = {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: string;
};

function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useChatStore() {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const loaded = useRef(false);

	// Load from AsyncStorage once on mount
	useEffect(() => {
		if (loaded.current) return;
		loaded.current = true;

		AsyncStorage.getItem(STORAGE_KEY)
			.then((raw) => {
				if (raw) {
					const parsed = JSON.parse(raw) as ChatMessage[];
					setMessages(parsed);
				}
			})
			.catch(() => {});
	}, []);

	// Persist whenever messages change (skip initial empty state)
	useEffect(() => {
		if (!loaded.current) return;
		AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages)).catch(() => {});
	}, [messages]);

	const addUserMessage = useCallback((content: string): ChatMessage => {
		const message: ChatMessage = {
			id: generateId(),
			role: "user",
			content,
			timestamp: new Date().toISOString(),
		};
		setMessages((prev) => [...prev, message].slice(-MAX_MESSAGES));
		return message;
	}, []);

	const addAssistantMessage = useCallback(
		(content: string, timestamp?: string): ChatMessage => {
			const message: ChatMessage = {
				id: generateId(),
				role: "assistant",
				content,
				timestamp: timestamp ?? new Date().toISOString(),
			};
			setMessages((prev) => [...prev, message].slice(-MAX_MESSAGES));
			return message;
		},
		[],
	);

	const getConversationHistory = useCallback(() => {
		return messages.map((msg) => ({
			role: msg.role,
			content: msg.content,
			timestamp: msg.timestamp,
		}));
	}, [messages]);

	const clearMessages = useCallback(() => {
		setMessages([]);
		AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
	}, []);

	return {
		messages,
		addUserMessage,
		addAssistantMessage,
		getConversationHistory,
		clearMessages,
	};
}
