import { Ionicons } from "@expo/vector-icons";
import { useRef, useState, useCallback } from "react";
import {
	ActivityIndicator,
	FlatList,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	Text,
	TextInput,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAccessibility } from "@/context/AccessibilityContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTRPC } from "@/lib/trpc";
import { useChatStore, type ChatMessage } from "@/stores/chatStore";
import { useMutation } from "@tanstack/react-query";

// ─── Chat Bubble ──────────────────────────────────────────────────────────────

function ChatBubble({
	message,
	isDarkMode,
	textSize,
}: {
	message: ChatMessage;
	isDarkMode: boolean;
	textSize: number;
}) {
	const isUser = message.role === "user";

	return (
		<View className={`mb-3 max-w-[85%] ${isUser ? "self-end" : "self-start"}`}>
			<View
				className={`rounded-2xl px-4 py-3 ${
					isUser
						? "rounded-br-sm bg-rose-400"
						: isDarkMode
							? "rounded-bl-sm bg-neutral-700"
							: "rounded-bl-sm bg-neutral-100"
				}`}
			>
				<Text
					className={`${
						isUser
							? "text-white"
							: isDarkMode
								? "text-neutral-100"
								: "text-neutral-800"
					}`}
					style={{ fontSize: 15 * textSize, lineHeight: 22 * textSize }}
				>
					{message.content}
				</Text>
			</View>
			<Text
				className={`mt-1 text-xs ${isUser ? "text-right" : "text-left"} ${
					isDarkMode ? "text-neutral-500" : "text-neutral-400"
				}`}
			>
				{new Date(message.timestamp).toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				})}
			</Text>
		</View>
	);
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator({ isDarkMode }: { isDarkMode: boolean }) {
	return (
		<View className="mb-3 self-start">
			<View
				className={`flex-row items-center gap-1 rounded-2xl rounded-bl-sm px-4 py-3 ${
					isDarkMode ? "bg-neutral-700" : "bg-neutral-100"
				}`}
			>
				<View className="h-2 w-2 rounded-full bg-neutral-400" />
				<View
					className={`h-2 w-2 rounded-full ${isDarkMode ? "bg-neutral-500" : "bg-neutral-300"}`}
				/>
				<View
					className={`h-2 w-2 rounded-full ${isDarkMode ? "bg-neutral-600" : "bg-neutral-200"}`}
				/>
			</View>
		</View>
	);
}

// ─── Welcome Message ──────────────────────────────────────────────────────────

function WelcomeMessage({
	isDarkMode,
	textSize,
	onSuggestionTap,
}: {
	isDarkMode: boolean;
	textSize: number;
	onSuggestionTap: (text: string) => void;
}) {
	const { t } = useLanguage();

	const suggestions = [
		t("assistant.suggestion1"),
		t("assistant.suggestion2"),
		t("assistant.suggestion3"),
	];

	return (
		<View className="flex-1 items-center justify-center px-8">
			<Ionicons
				name="chatbubble-ellipses"
				size={64}
				color={isDarkMode ? "#d99696" : "#e8a0a0"}
			/>
			<Text
				className={`mt-4 text-center font-semibold ${
					isDarkMode ? "text-neutral-100" : "text-neutral-800"
				}`}
				style={{ fontSize: 20 * textSize }}
			>
				{t("assistant.title")}
			</Text>
			<Text
				className={`mt-2 text-center ${
					isDarkMode ? "text-neutral-400" : "text-neutral-500"
				}`}
				style={{ fontSize: 14 * textSize, lineHeight: 20 * textSize }}
			>
				{t("assistant.welcomeMessage")}
			</Text>
			<View className="mt-6 gap-2">
				{suggestions.map((suggestion) => (
					<Pressable
						key={suggestion}
						onPress={() => onSuggestionTap(suggestion)}
						className={`rounded-xl px-4 py-2 ${
							isDarkMode ? "bg-neutral-800" : "bg-neutral-100"
						}`}
					>
						<Text
							className={`text-center ${
								isDarkMode ? "text-neutral-300" : "text-neutral-600"
							}`}
							style={{ fontSize: 13 * textSize }}
						>
							{suggestion}
						</Text>
					</Pressable>
				))}
			</View>
		</View>
	);
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AssistantScreen() {
	const { isDarkMode, textSize } = useAccessibility();
	const { locale } = useLanguage();
	const trpc = useTRPC();
	const flatListRef = useRef<FlatList>(null);



	const {
		messages,
		addUserMessage,
		addAssistantMessage,
		getConversationHistory,
		clearMessages,
	} = useChatStore();

	const [inputText, setInputText] = useState("");

	const chatMutation = useMutation({
		...trpc.agent.chat.mutationOptions(),
		onSuccess: (data) => {
			console.log("[Chat] onSuccess fired:", data.reply.substring(0, 50));
			addAssistantMessage(data.reply, data.timestamp);
		},
		onError: (error) => {
			console.log("[Chat] onError fired:", error.message);
			const errorMsg =
				locale === "tr"
					? "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin."
					: "Sorry, an error occurred. Please try again.";
			addAssistantMessage(errorMsg);
		},
		onSettled: () => {
			console.log("[Chat] onSettled fired - mutation completed");
		},
	});

	const handleSend = useCallback(
		(text?: string) => {
			const messageText = text ?? inputText.trim();
			if (!messageText || chatMutation.isPending) return;

			addUserMessage(messageText);
			setInputText("");

			setTimeout(() => {
				flatListRef.current?.scrollToEnd({ animated: true });
			}, 100);

			chatMutation.mutate({
				message: messageText,
				conversationHistory: getConversationHistory(),
				language: locale,
			});
		},
		[inputText, chatMutation, addUserMessage, getConversationHistory, locale],
	);

	const handleSuggestionTap = useCallback(
		(suggestion: string) => {
			// Strip surrounding quotes from the suggestion text
			const cleanText = suggestion.replace(/^[""]|[""]$/g, "");
			handleSend(cleanText);
		},
		[handleSend],
	);

	const handleClear = useCallback(() => {
		clearMessages();
	}, [clearMessages]);

	const hasMessages = messages.length > 0;

	return (
		<SafeAreaView
			className={`flex-1 ${isDarkMode ? "bg-[#1a1212]" : "bg-white"}`}
			edges={["top"]}
		>
			<KeyboardAvoidingView
				behavior="padding"
				style={{ flex: 1 }}
				keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
				enabled={true}
			>
				<View style={{ flex: 1 }}>
					{/* Header */}
					<View
						className={`flex-row items-center justify-between border-b px-4 py-3 ${
							isDarkMode ? "border-neutral-800" : "border-neutral-200"
						}`}
					>
						<View className="flex-row items-center gap-2">
							<Ionicons name="sparkles" size={22} color="#d99696" />
							<Text
								className={`font-semibold ${
									isDarkMode ? "text-neutral-100" : "text-neutral-800"
								}`}
								style={{ fontSize: 18 * textSize }}
							>
								MedSafe AI
							</Text>
						</View>
						{hasMessages && (
							<Pressable onPress={handleClear} hitSlop={12}>
								<Ionicons
									name="trash-outline"
									size={20}
									color={isDarkMode ? "#a38383" : "#9ca3af"}
								/>
							</Pressable>
						)}
					</View>

					{/* Messages or Welcome */}
					<View style={{ flex: 1 }}>
						{hasMessages ? (
							<FlatList
								ref={flatListRef}
								data={messages}
								keyExtractor={(item) => item.id}
								contentContainerStyle={{
									paddingHorizontal: 16,
									paddingVertical: 12,
								}}
								renderItem={({ item }) => (
									<ChatBubble
										message={item}
										isDarkMode={isDarkMode}
										textSize={textSize}
									/>
								)}
								onContentSizeChange={() => {
									flatListRef.current?.scrollToEnd({ animated: true });
								}}
								ListFooterComponent={
									chatMutation.isPending ? (
										<TypingIndicator isDarkMode={isDarkMode} />
									) : null
								}
							/>
						) : (
							<WelcomeMessage
								isDarkMode={isDarkMode}
								textSize={textSize}
								onSuggestionTap={handleSuggestionTap}
							/>
						)}
					</View>

					{/* Input Bar */}
					<View
						className={`flex-row items-end gap-2 border-t px-4 py-3 ${
							isDarkMode ? "border-neutral-800" : "border-neutral-200"
						}`}
					>
						<TextInput
							className={`min-h-[40px] max-h-[120px] flex-1 rounded-2xl px-4 py-2 ${
								isDarkMode
									? "bg-neutral-800 text-neutral-100"
									: "bg-neutral-100 text-neutral-800"
							}`}
							style={{ fontSize: 15 * textSize }}
							placeholder={
								locale === "tr" ? "Mesajınızı yazın..." : "Type your message..."
							}
							placeholderTextColor={isDarkMode ? "#6b5e5e" : "#9ca3af"}
							value={inputText}
							onChangeText={setInputText}
							multiline
							maxLength={500}
							onSubmitEditing={() => handleSend()}
							returnKeyType="send"
							editable={!chatMutation.isPending}
						/>
						<Pressable
							onPress={() => handleSend()}
							disabled={!inputText.trim() || chatMutation.isPending}
							className={`h-10 w-10 items-center justify-center rounded-full ${
								inputText.trim() && !chatMutation.isPending
									? "bg-rose-400"
									: isDarkMode
										? "bg-neutral-700"
										: "bg-neutral-200"
							}`}
						>
							{chatMutation.isPending ? (
								<ActivityIndicator size="small" color="#fff" />
							) : (
								<Ionicons name="send" size={18} color="#fff" />
							)}
						</Pressable>
					</View>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
