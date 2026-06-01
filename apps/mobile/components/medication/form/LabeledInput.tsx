import { Ionicons } from "@expo/vector-icons";
import { type KeyboardTypeOptions, Text, TextInput, View } from "react-native";
import type { IconName } from "@/lib/medication-display";

const FIELD_LABEL =
	"font-semibold text-xs uppercase tracking-wide text-text-sub-light dark:text-text-sub-dark";

interface LabeledInputProps {
	label: string;
	optionalText?: string;
	icon?: IconName;
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
	keyboardType?: KeyboardTypeOptions;
	emphasized?: boolean;
}

export const LabeledInput = ({
	label,
	optionalText,
	icon,
	value,
	onChangeText,
	placeholder,
	keyboardType = "default",
	emphasized,
}: LabeledInputProps) => (
	<View className="gap-2">
		<Text className={FIELD_LABEL}>
			{label}
			{optionalText ? (
				<Text className="font-normal text-text-sub-light dark:text-text-sub-dark">
					{" "}
					{optionalText}
				</Text>
			) : null}
		</Text>
		<View className="h-14 flex-row items-center rounded-2xl border border-border-light bg-background-light px-4 dark:border-border-dark dark:bg-background-dark">
			{icon ? (
				<Ionicons name={icon} size={20} className="mr-2.5 text-gray-400" />
			) : null}
			<TextInput
				className={`h-full flex-1 text-base text-text-main-light dark:text-text-main-dark ${emphasized ? "font-semibold text-lg" : ""}`}
				placeholder={placeholder}
				placeholderTextColor="#9ca3af"
				value={value}
				onChangeText={onChangeText}
				keyboardType={keyboardType}
			/>
		</View>
	</View>
);

export { FIELD_LABEL };
