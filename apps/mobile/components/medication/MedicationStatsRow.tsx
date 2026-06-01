import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { MEAL_ICONS } from "@/lib/medication-display";
import { formatFrequency, formatMealStatus } from "@/lib/medication-format";

interface MedicationStatsRowProps {
	frequency: string;
	mealStatus: string;
	stock: number;
	isLowStock: boolean;
}

const STAT_CARD =
	"flex-1 items-center rounded-2xl bg-surface-light p-3.5 shadow-sm dark:bg-surface-dark";
const STAT_LABEL =
	"mb-1 font-semibold text-[10px] uppercase text-text-sub-light dark:text-text-sub-dark";
const STAT_VALUE =
	"font-bold text-sm text-text-main-light dark:text-text-main-dark";

export const MedicationStatsRow = ({
	frequency,
	mealStatus,
	stock,
	isLowStock,
}: MedicationStatsRowProps) => (
	<View className="mb-4 flex-row gap-3">
		<View className={STAT_CARD}>
			<Ionicons
				name="calendar-outline"
				size={20}
				className="mb-1.5 text-primary"
			/>
			<Text className={STAT_LABEL}>Frequency</Text>
			<Text className={STAT_VALUE}>{formatFrequency(frequency)}</Text>
		</View>
		<View className={STAT_CARD}>
			<Ionicons
				name={MEAL_ICONS[mealStatus] ?? "time-outline"}
				size={20}
				className="mb-1.5 text-primary"
			/>
			<Text className={STAT_LABEL}>Timing</Text>
			<Text className={STAT_VALUE}>{formatMealStatus(mealStatus)}</Text>
		</View>
		<View
			className={`${STAT_CARD} ${isLowStock ? "border border-red-200 bg-red-50" : ""}`}
		>
			<Ionicons
				name="cube-outline"
				size={20}
				className={`mb-1.5 ${isLowStock ? "text-red-600" : "text-primary"}`}
			/>
			<Text className={STAT_LABEL}>Stock</Text>
			<Text className={`${STAT_VALUE} ${isLowStock ? "text-red-600" : ""}`}>
				{stock}
			</Text>
		</View>
	</View>
);
