import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import {
	Alert,
	FlatList,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChatBubble } from "@/components/assistant/ChatBubble";
import { ChatInputBar } from "@/components/assistant/ChatInputBar";
import { ListeningIndicator } from "@/components/assistant/ListeningIndicator";
import { TypingIndicator } from "@/components/assistant/TypingIndicator";
import { WelcomeMessage } from "@/components/assistant/WelcomeMessage";
import { AssistantColors } from "@/constants/theme";
import { useAccessibility } from "@/context/AccessibilityContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useTRPC } from "@/lib/trpc";
import { useChatStore } from "@/stores/chatStore";

export default function AssistantScreen() {
	const { isDarkMode, textSize } = useAccessibility();
	const { locale, t } = useLanguage();
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

	const { speak, stop: stopSpeaking, speakingId } = useTextToSpeech(locale);

	const finishRecordingRef = useRef<() => Promise<void>>(async () => {});
	const { isRecording, startRecording, stopRecording } = useVoiceRecorder({
		onMaxDuration: () => {
			void finishRecordingRef.current();
		},
	});

	const chatMutation = useMutation({
		...trpc.agent.chat.mutationOptions(),
		onSuccess: (data) => {
			addAssistantMessage(data.reply, data.timestamp);
		},
		onError: () => {
			addAssistantMessage(t("assistant.errorMessage"));
		},
	});

	const transcribeMutation = useMutation({
		...trpc.agent.transcribe.mutationOptions(),
	});

	const handleSend = useCallback(
		(text?: string) => {
			const messageText = text ?? inputText.trim();
			if (!messageText || chatMutation.isPending) return;

			addUserMessage(messageText);
			setInputText("");
			stopSpeaking();

			setTimeout(() => {
				flatListRef.current?.scrollToEnd({ animated: true });
			}, 100);

			chatMutation.mutate({
				message: messageText,
				conversationHistory: getConversationHistory(),
				language: locale,
			});
		},
		[
			inputText,
			chatMutation,
			addUserMessage,
			getConversationHistory,
			locale,
			stopSpeaking,
		],
	);

	const handleSuggestionTap = useCallback(
		(suggestion: string) => {
			const cleanText = suggestion.replace(/^["']|["']$/g, "");
			handleSend(cleanText);
		},
		[handleSend],
	);

	const handleClear = useCallback(() => {
		stopSpeaking();
		clearMessages();
	}, [clearMessages, stopSpeaking]);

	const finishRecordingAndTranscribe = useCallback(async () => {
		const result = await stopRecording();
		if (result.kind === "too_short") {
			Alert.alert(
				t("assistant.permissionRequired"),
				t("assistant.recordingTooShort"),
			);
			return;
		}
		if (result.kind !== "ok") return;

		try {
			const { text } = await transcribeMutation.mutateAsync({
				audioBase64: result.audioBase64,
				language: locale,
			});
			if (!text) {
				Alert.alert(
					t("assistant.permissionRequired"),
					t("assistant.emptyTranscription"),
				);
				return;
			}
			handleSend(text);
		} catch {
			Alert.alert(
				t("assistant.permissionRequired"),
				t("assistant.voiceRecognitionFailed"),
			);
		}
	}, [stopRecording, transcribeMutation, locale, t, handleSend]);

	finishRecordingRef.current = finishRecordingAndTranscribe;

	const handleMicPress = useCallback(async () => {
		if (transcribeMutation.isPending) return;

		if (isRecording) {
			await finishRecordingAndTranscribe();
			return;
		}

		stopSpeaking();
		transcribeMutation.reset();
		const { error } = await startRecording();
		if (error === "permission_denied") {
			Alert.alert(
				t("assistant.permissionRequired"),
				t("assistant.micPermissionDenied"),
			);
		}
	}, [
		isRecording,
		startRecording,
		stopSpeaking,
		transcribeMutation,
		finishRecordingAndTranscribe,
		t,
	]);

	const isProcessingVoice = transcribeMutation.isPending;
	const hasMessages = messages.length > 0;

	return (
		<SafeAreaView
			className="flex-1"
			style={{
				backgroundColor: isDarkMode
					? AssistantColors.screenBg.dark
					: AssistantColors.screenBg.light,
			}}
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
							<Ionicons
								name="sparkles"
								size={22}
								color={AssistantColors.accentSoft.dark}
							/>
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
									color={
										isDarkMode
											? AssistantColors.iconMuted.dark
											: AssistantColors.iconMuted.light
									}
								/>
							</Pressable>
						)}
					</View>

					{/* Body */}
					<View style={{ flex: 1 }}>
						{isRecording || isProcessingVoice ? (
							<ListeningIndicator
								isDarkMode={isDarkMode}
								textSize={textSize}
								transcript={
									isProcessingVoice ? t("assistant.transcribing") : ""
								}
								label={
									isProcessingVoice
										? t("assistant.processing")
										: t("assistant.listening")
								}
								isProcessing={isProcessingVoice}
							/>
						) : hasMessages ? (
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
										speakingId={speakingId}
										onSpeak={speak}
										speakLabel={t("assistant.speakHint")}
										stopSpeakLabel={t("assistant.stopSpeaking")}
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

					{/* Input */}
					<ChatInputBar
						isDarkMode={isDarkMode}
						textSize={textSize}
						inputText={inputText}
						onChangeText={setInputText}
						onSubmit={() => handleSend()}
						onMicPress={handleMicPress}
						isRecording={isRecording}
						isProcessingVoice={isProcessingVoice}
						isSending={chatMutation.isPending}
						placeholder={t("assistant.inputPlaceholder")}
						micA11yLabel={t("assistant.voiceInputHint")}
						stopA11yLabel={t("assistant.stopSpeaking")}
					/>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
