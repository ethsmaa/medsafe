import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, TextInput, View } from "react-native";
import { AssistantColors } from "@/constants/theme";

type Props = {
	isDarkMode: boolean;
	textSize: number;
	inputText: string;
	onChangeText: (text: string) => void;
	onSubmit: () => void;
	onMicPress: () => void;
	isRecording: boolean;
	isProcessingVoice: boolean;
	isSending: boolean;
	placeholder: string;
	micA11yLabel: string;
	stopA11yLabel: string;
};

export function ChatInputBar({
	isDarkMode,
	textSize,
	inputText,
	onChangeText,
	onSubmit,
	onMicPress,
	isRecording,
	isProcessingVoice,
	isSending,
	placeholder,
	micA11yLabel,
	stopA11yLabel,
}: Props) {
	const showSendable = inputText.trim().length > 0;

	return (
		<View
			className={`flex-row items-end gap-2 border-t px-4 py-3 ${
				isDarkMode ? "border-neutral-800" : "border-neutral-200"
			}`}
		>
			<Pressable
				onPress={onMicPress}
				disabled={isSending}
				accessibilityRole="button"
				accessibilityLabel={isRecording ? stopA11yLabel : micA11yLabel}
				className={`h-10 w-10 items-center justify-center rounded-full ${
					isRecording
						? "bg-red-400"
						: isDarkMode
							? "bg-neutral-700"
							: "bg-neutral-200"
				}`}
			>
				{isProcessingVoice ? (
					<ActivityIndicator
						size="small"
						color={
							isDarkMode
								? AssistantColors.micIdleIcon.dark
								: AssistantColors.micIdleIcon.light
						}
					/>
				) : (
					<Ionicons
						name={isRecording ? "stop" : "mic"}
						size={20}
						color={
							isRecording
								? "#fff"
								: isDarkMode
									? AssistantColors.micIdleIcon.dark
									: AssistantColors.micIdleIcon.light
						}
					/>
				)}
			</Pressable>

			<TextInput
				className={`max-h-[120px] min-h-[40px] flex-1 rounded-2xl px-4 py-2 ${
					isDarkMode
						? "bg-neutral-800 text-neutral-100"
						: "bg-neutral-100 text-neutral-800"
				}`}
				style={{ fontSize: 15 * textSize }}
				placeholder={placeholder}
				placeholderTextColor={
					isDarkMode
						? AssistantColors.inputPlaceholder.dark
						: AssistantColors.inputPlaceholder.light
				}
				value={inputText}
				onChangeText={onChangeText}
				multiline
				maxLength={500}
				onSubmitEditing={onSubmit}
				returnKeyType="send"
				editable={!isSending && !isRecording}
			/>

			<Pressable
				onPress={onSubmit}
				disabled={!showSendable || isSending}
				className={`h-10 w-10 items-center justify-center rounded-full ${
					showSendable && !isSending
						? "bg-rose-400"
						: isDarkMode
							? "bg-neutral-700"
							: "bg-neutral-200"
				}`}
			>
				{isSending ? (
					<ActivityIndicator size="small" color="#fff" />
				) : (
					<Ionicons name="send" size={18} color="#fff" />
				)}
			</Pressable>
		</View>
	);
}
