import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { AssistantColors } from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
	isDarkMode: boolean;
	textSize: number;
	onSuggestionTap: (text: string) => void;
};

export function WelcomeMessage({
	isDarkMode,
	textSize,
	onSuggestionTap,
}: Props) {
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
				color={
					isDarkMode
						? AssistantColors.accentSoft.dark
						: AssistantColors.accentSoft.light
				}
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
