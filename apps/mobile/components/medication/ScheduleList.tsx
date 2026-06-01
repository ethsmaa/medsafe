import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

interface ScheduleItem {
	id: string;
	genericName: string;
	dosage: string;
	timeOfDay: string;
	taken: boolean;
}

interface ScheduleListProps {
	schedule: ScheduleItem[];
	nextDoseId?: string;
}

const ICON_CONTAINER =
	"z-10 mr-4 h-6 w-6 items-center justify-center rounded-full border-2 border-surface-light dark:border-surface-dark";
const CONTENT =
	"flex-1 flex-row items-center justify-between rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border-dark dark:bg-surface-dark";

export const ScheduleList = ({ schedule, nextDoseId }: ScheduleListProps) => {
	if (schedule.length === 0) {
		return (
			<Text className="ml-6 text-text-sub-light italic dark:text-text-sub-dark">
				No medications scheduled.
			</Text>
		);
	}

	return (
		<View className="pl-6">
			{schedule.map((item, index) => {
				const isNext = item.id === nextDoseId;
				const isLast = index === schedule.length - 1;

				return (
					<View key={index} className="relative mb-6 flex-row">
						{/* Status Icon */}
						<View
							className={`${ICON_CONTAINER} ${item.taken ? "bg-success-light dark:bg-success-dark" : "bg-gray-200 dark:bg-border-dark"}`}
						>
							<Ionicons
								name={item.taken ? "checkmark" : isNext ? "time" : "hourglass"}
								size={18}
								className={
									item.taken || isNext ? "text-white" : "text-gray-400"
								}
							/>
						</View>

						{/* Line Connector */}
						{!isLast && (
							<View className="absolute top-6 -bottom-6 left-[9px] -z-10 w-0.5 bg-border-light dark:bg-border-dark" />
						)}

						{/* Content */}
						<View
							className={`${CONTENT} ${isNext ? "border-primary border-l-4" : ""}`}
						>
							<View className="flex-1">
								<Text
									className={`font-bold text-base ${item.taken ? "text-text-sub-light line-through dark:text-text-sub-dark" : "text-text-main-light dark:text-text-main-dark"}`}
								>
									{item.genericName}
								</Text>
								<Text className="text-text-sub-light text-xs dark:text-text-sub-dark">
									{item.dosage}
								</Text>
							</View>
							<Text
								className={`text-sm ${isNext ? "font-bold text-primary" : "font-medium text-text-sub-light dark:text-text-sub-dark"}`}
							>
								{item.timeOfDay}
							</Text>
						</View>
					</View>
				);
			})}
		</View>
	);
};
