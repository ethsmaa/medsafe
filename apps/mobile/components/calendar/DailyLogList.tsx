import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Text, View } from "react-native";

export interface LogItem {
	id: string;
	type: string;
	time: string;
	medName: string;
	dosage: string;
	status: string;
	medId: string;
}

interface DailyLogListProps {
	isLoading: boolean;
	logs: LogItem[];
}

type StatusStyle = {
	indicator: string;
	badge: string;
	badgeText: string;
	icon: keyof typeof Ionicons.glyphMap;
	iconClass: string;
};

const STATUS_STYLES: Record<"TAKEN" | "MISSED" | "UPCOMING", StatusStyle> = {
	TAKEN: {
		indicator: "bg-success-light dark:bg-success-dark",
		badge: "bg-emerald-100 dark:bg-emerald-900/30",
		badgeText: "text-emerald-700 dark:text-emerald-300",
		icon: "checkmark-circle",
		iconClass: "text-success-light dark:text-success-dark",
	},
	MISSED: {
		indicator: "bg-error-light dark:bg-error-dark",
		badge: "bg-red-100 dark:bg-red-900/30",
		badgeText: "text-red-700 dark:text-red-300",
		icon: "alert-circle",
		iconClass: "text-error-light dark:text-error-dark",
	},
	UPCOMING: {
		indicator: "bg-slate-300 dark:bg-slate-600",
		badge: "bg-slate-100 dark:bg-slate-800",
		badgeText: "text-slate-500 dark:text-slate-400",
		icon: "time",
		iconClass: "text-slate-300 dark:text-slate-500",
	},
};

function statusStyle(status: string): StatusStyle {
	if (status === "TAKEN") return STATUS_STYLES.TAKEN;
	if (status === "MISSED") return STATUS_STYLES.MISSED;
	return STATUS_STYLES.UPCOMING;
}

export const DailyLogList = ({ isLoading, logs }: DailyLogListProps) => {
	if (isLoading) {
		return <ActivityIndicator size="large" color="#d99696" className="mt-10" />;
	}

	if (logs.length === 0) {
		return (
			<View className="mt-10 items-center justify-center opacity-50">
				<Ionicons
					name="calendar-outline"
					size={48}
					className="text-text-sub-light dark:text-text-sub-dark"
				/>
				<Text className="mt-3 text-base text-text-sub-light dark:text-text-sub-dark">
					No records for this day.
				</Text>
			</View>
		);
	}

	return (
		<View className="gap-4">
			{logs.map((item) => {
				const cfg = statusStyle(item.status);
				return (
					<View
						key={item.id}
						className="flex-row overflow-hidden rounded-2xl border border-border-light bg-surface-light shadow-sm dark:border-border-dark dark:bg-surface-dark"
					>
						<View className={`h-full w-1.5 ${cfg.indicator}`} />

						<View className="flex-1 gap-2 p-4">
							<View className="flex-row items-center justify-between">
								<Text className="font-bold text-base text-text-main-light dark:text-text-main-dark">
									{item.time}
								</Text>
								<View className={`rounded-lg px-2 py-0.5 ${cfg.badge}`}>
									<Text className={`font-bold text-[10px] ${cfg.badgeText}`}>
										{item.status}
									</Text>
								</View>
							</View>
							<View>
								<Text className="font-semibold text-base text-text-sub-light dark:text-text-sub-dark">
									{item.medName}
								</Text>
								<Text className="text-sm text-text-sub-light dark:text-text-sub-dark">
									{item.dosage}
								</Text>
							</View>
						</View>

						<View className="items-center justify-center p-4">
							<Ionicons name={cfg.icon} size={28} className={cfg.iconClass} />
						</View>
					</View>
				);
			})}
		</View>
	);
};
