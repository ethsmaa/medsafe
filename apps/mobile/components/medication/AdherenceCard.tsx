import { useColorScheme } from "nativewind";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface AdherenceCardProps {
	takenCount: number;
	totalCount: number;
	percentage: number;
}

export const AdherenceCard = ({
	takenCount,
	totalCount,
	percentage,
}: AdherenceCardProps) => {
	const { colorScheme } = useColorScheme();

	const radius = 35;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (percentage / 100) * circumference;
	// SVG strokes can't use className/tokens, so resolve from the active scheme.
	const trackStroke = colorScheme === "dark" ? "#4a3e3e" : "#f3f4f6";

	return (
		<View className="mb-8 flex-row items-center justify-between rounded-3xl bg-surface-light p-6 shadow-sm dark:bg-surface-dark">
			<View>
				<Text className="mb-1 font-bold text-base text-text-main-light dark:text-text-main-dark">
					Daily Adherence
				</Text>
				<Text className="text-sm text-text-sub-light dark:text-text-sub-dark">
					{takenCount} of {totalCount} meds taken
				</Text>
			</View>
			<View className="relative h-20 w-20 items-center justify-center">
				<Svg height="80" width="80" viewBox="0 0 100 100">
					<Circle
						cx="50"
						cy="50"
						r={radius}
						stroke={trackStroke}
						strokeWidth="10"
						fill="none"
					/>
					<Circle
						cx="50"
						cy="50"
						r={radius}
						stroke="#d99696"
						strokeWidth="10"
						strokeDasharray={circumference}
						strokeDashoffset={strokeDashoffset}
						strokeLinecap="round"
						fill="none"
						transform="rotate(-90 50 50)"
					/>
					<Text className="absolute top-8 left-6 font-bold text-sm text-text-main-light dark:text-text-main-dark">
						{percentage}%
					</Text>
				</Svg>
			</View>
		</View>
	);
};
