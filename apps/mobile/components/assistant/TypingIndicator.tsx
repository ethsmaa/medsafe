import { View } from "react-native";

export function TypingIndicator({ isDarkMode }: { isDarkMode: boolean }) {
	return (
		<View className="mb-3 self-start">
			<View
				className={`flex-row items-center gap-1 rounded-2xl rounded-bl-sm px-4 py-3 ${
					isDarkMode ? "bg-neutral-700" : "bg-neutral-100"
				}`}
			>
				<View className="h-2 w-2 rounded-full bg-neutral-400" />
				<View
					className={`h-2 w-2 rounded-full ${
						isDarkMode ? "bg-neutral-500" : "bg-neutral-300"
					}`}
				/>
				<View
					className={`h-2 w-2 rounded-full ${
						isDarkMode ? "bg-neutral-600" : "bg-neutral-200"
					}`}
				/>
			</View>
		</View>
	);
}
