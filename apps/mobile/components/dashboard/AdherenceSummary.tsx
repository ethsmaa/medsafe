import { type DimensionValue, Text, View } from "react-native";

interface AdherenceSummaryProps {
	taken: number;
	total: number;
	percentage: number;
}

export function AdherenceSummary({
	taken,
	total,
	percentage,
}: AdherenceSummaryProps) {
	// Calculate width for progress bar
	const progressWidth = `${Math.min(Math.max(percentage, 0), 100)}%`;

	// Determine status message
	let statusMessage = "Keep it up!";
	let statusColor = "text-green-600 dark:text-green-400";

	if (percentage === 100 && total > 0) {
		statusMessage = "Perfect score!";
	} else if (percentage < 50 && total > 0) {
		statusMessage = "You're missing a few.";
		statusColor = "text-orange-500 dark:text-orange-400";
	} else if (total === 0) {
		statusMessage = "Nothing scheduled yet.";
		statusColor = "text-gray-500 dark:text-gray-400";
	}

	return (
		<View className="mb-8 rounded-2xl bg-surface-light p-5 shadow-sm dark:bg-surface-dark">
			<View className="mb-4 flex-row items-center justify-between">
				<View>
					<Text className="font-bold text-lg text-text-main-light dark:text-text-main-dark">
						Daily Progress
					</Text>
					<Text className={`font-medium text-sm ${statusColor}`}>
						{statusMessage}
					</Text>
				</View>
				<View className="items-end">
					<Text className="font-bold text-2xl text-primary dark:text-primary">
						{taken} <Text className="text-base text-gray-400">/ {total}</Text>
					</Text>
					<Text className="text-text-sub-light text-xs dark:text-text-sub-dark">
						Meds Taken
					</Text>
				</View>
			</View>

			{/* Progress Bar Container */}
			<View className="h-4 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
				{/* Active Progress */}
				<View
					className="h-full rounded-full bg-primary"
					style={{ width: progressWidth as DimensionValue }}
				/>
			</View>
		</View>
	);
}
