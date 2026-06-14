import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { FIELD_LABEL } from "./LabeledInput";

interface OptionChipsProps<T extends string | number> {
	label: string;
	options: readonly T[];
	selected: T;
	onSelect: (value: T) => void;
	renderLabel?: (value: T) => string;
	scroll?: boolean;
}

export function OptionChips<T extends string | number>({
	label,
	options,
	selected,
	onSelect,
	renderLabel,
	scroll = true,
}: OptionChipsProps<T>) {
	const chips = options.map((opt) => (
		<TouchableOpacity
			key={String(opt)}
			onPress={() => onSelect(opt)}
			accessibilityRole="button"
			accessibilityState={{ selected: opt === selected }}
			accessibilityLabel={renderLabel ? renderLabel(opt) : String(opt)}
			className={`min-w-[56px] items-center rounded-full px-4 py-2.5 ${
				opt === selected
					? "bg-primary"
					: "bg-background-light dark:bg-background-dark"
			}`}
		>
			<Text
				className={`font-semibold text-sm ${
					opt === selected
						? "text-white"
						: "text-text-sub-light dark:text-text-sub-dark"
				}`}
			>
				{renderLabel ? renderLabel(opt) : String(opt)}
			</Text>
		</TouchableOpacity>
	));

	return (
		<View className="gap-2">
			<Text className={FIELD_LABEL}>{label}</Text>
			{scroll ? (
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerClassName="gap-2 pr-5"
				>
					{chips}
				</ScrollView>
			) : (
				<View className="flex-row gap-2">{chips}</View>
			)}
		</View>
	);
}
