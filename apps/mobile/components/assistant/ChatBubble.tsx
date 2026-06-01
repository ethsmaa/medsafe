import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { AssistantColors } from "@/constants/theme";
import type { ChatMessage } from "@/stores/chatStore";

type Props = {
	message: ChatMessage;
	isDarkMode: boolean;
	textSize: number;
	speakingId: string | null;
	onSpeak: (text: string, id: string) => void;
	speakLabel: string;
	stopSpeakLabel: string;
};

export function ChatBubble({
	message,
	isDarkMode,
	textSize,
	speakingId,
	onSpeak,
	speakLabel,
	stopSpeakLabel,
}: Props) {
	const isUser = message.role === "user";
	const isSpeaking = speakingId === message.id;

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
					className={
						isUser
							? "text-white"
							: isDarkMode
								? "text-neutral-100"
								: "text-neutral-800"
					}
					style={{ fontSize: 15 * textSize, lineHeight: 22 * textSize }}
				>
					{message.content}
				</Text>
			</View>
			<View
				className={`mt-1 flex-row items-center ${
					isUser ? "justify-end" : "justify-start"
				}`}
			>
				<Text
					className={`text-xs ${
						isDarkMode ? "text-neutral-500" : "text-neutral-400"
					}`}
				>
					{new Date(message.timestamp).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</Text>
				{!isUser && (
					<Pressable
						onPress={() => onSpeak(message.content, message.id)}
						hitSlop={8}
						accessibilityRole="button"
						accessibilityLabel={isSpeaking ? stopSpeakLabel : speakLabel}
						className="ml-2"
					>
						<Ionicons
							name={isSpeaking ? "volume-high" : "volume-medium-outline"}
							size={16 * textSize}
							color={
								isSpeaking
									? AssistantColors.accent
									: isDarkMode
										? AssistantColors.iconMuted.dark
										: AssistantColors.iconMuted.light
							}
						/>
					</Pressable>
				)}
			</View>
		</View>
	);
}
