/**
 * Chat store for the MedSafe AI Health Assistant.
 * Uses useState + AsyncStorage with a debounced persist to avoid writes
 * on every message addition.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "chat_messages";
const MAX_MESSAGES = 50;
const HISTORY_LIMIT = 10;
const PERSIST_DEBOUNCE_MS = 300;

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
	const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

	useEffect(() => {
		if (!loaded.current) return;
		if (persistTimer.current) clearTimeout(persistTimer.current);
		persistTimer.current = setTimeout(() => {
			AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages)).catch(() => {});
		}, PERSIST_DEBOUNCE_MS);

		return () => {
			if (persistTimer.current) clearTimeout(persistTimer.current);
		};
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

	const conversationHistory = useMemo(
		() =>
			messages.slice(-HISTORY_LIMIT).map((msg) => ({
				role: msg.role,
				content: msg.content,
				timestamp: msg.timestamp,
			})),
		[messages],
	);

	const getConversationHistory = useCallback(
		() => conversationHistory,
		[conversationHistory],
	);

	const clearMessages = useCallback(() => {
		setMessages([]);
		if (persistTimer.current) clearTimeout(persistTimer.current);
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
