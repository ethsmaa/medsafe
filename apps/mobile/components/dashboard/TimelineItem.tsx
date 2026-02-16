import { Ionicons } from "@expo/vector-icons";
import { format, getHours } from "date-fns";
import { Text, View } from "react-native";

import type { ScheduleItem } from "@/hooks/useMedicationSchedule";

interface TimelineItemProps {
	item: ScheduleItem;
	isNext?: boolean;
	isLast?: boolean;
}

export function TimelineItem({
	item,
	isNext = false,
	isLast = false,
}: TimelineItemProps) {
	const date = new Date(item.scheduledTime);
	const timeString = format(date, "hh:mm a");
	const hour = getHours(date);
	const isTaken = item.status === "TAKEN";

	// Icon Logic
	let iconName: keyof typeof Ionicons.glyphMap = "hourglass-outline";
	let iconColor = "#9ca3af"; // gray-400
	let circleBg = "bg-white";
	let circleBorder = "border-gray-200";

	if (isTaken) {
		iconName = "checkmark";
		iconColor = "white";
		circleBg = "bg-green-500";
		circleBorder = "border-green-500";
	} else if (isNext) {
		iconName = "time";
		iconColor = "black"; // Or dark gray
		circleBg = "bg-cyan-400"; // Cyan accent from screenshot
		circleBorder = "border-cyan-400";
	} else {
		// Future / Pending
		// Contextual icons based on time
		if (hour >= 20 || hour <= 5) {
			iconName = "moon";
		} else {
			iconName = "hourglass-outline";
		}
		iconColor = "#9ca3af";
		circleBg = "bg-white";
		circleBorder = "border-gray-200";
	}

	return (
		<View className="flex-row">
			{/* Left Column: Timeline */}
			<View className="w-16 mr-4 items-center">
				{/* Vertical Line */}
				{!isLast && (
					<View className="absolute top-0 bottom-[-24] w-[2px] bg-gray-200 dark:bg-gray-700" />
				)}

				{/* Circle Icon */}
				<View
					className={`h-12 w-12 items-center justify-center rounded-full border-2 ${circleBg} ${circleBorder} z-10`}
				>
					<Ionicons name={iconName} size={24} color={iconColor} />
				</View>
			</View>

			{/* Right Column: Card */}
			<View className="flex-1 pb-6">
				<View
					className={`flex-1 flex-row items-center justify-between rounded-2xl bg-white p-5 shadow-sm dark:bg-surface-dark ${
						isNext ? "border-l-4 border-l-cyan-400" : ""
					}`}
				>
					<View className="flex-1">
						<View className="flex-row justify-between items-start mb-1">
							<Text
								className={`text-lg font-bold ${
									isTaken
										? "text-gray-400 line-through dark:text-gray-500"
										: "text-text-main-light dark:text-text-main-dark"
								}`}
							>
								{item.medication?.name || item.genericName || "Medication"}
							</Text>
							<Text
								className={`font-semibold ${
									isNext
										? "text-cyan-500"
										: isTaken
											? "text-gray-300 line-through"
											: "text-text-main-light dark:text-text-main-dark"
								}`}
							>
								{timeString}
							</Text>
						</View>

						<Text
							className={`text-sm ${
								isTaken ? "text-gray-300 line-through" : "text-gray-500"
							}`}
						>
							{item.medication?.dosage || item.dosage || "No dosage info"}
							{/* Mocking "With Food" based on screenshot, purely visual for now or if data exists */}
							{/* {item.medication.instructions ? ` • ${item.medication.instructions}` : ""} */}
						</Text>
					</View>
				</View>
			</View>
		</View>
	);
}
