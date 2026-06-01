import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface NextDose {
	id: string;
	genericName: string;
	dosage: string;
	form: string;
	timeOfDay: string;
	mealStatus: string;
	prescriptionMedicationId: string;
}

interface NextDoseCardProps {
	nextDose: NextDose | null;
	onTakeNow: (med: NextDose) => void;
	isTaking: boolean;
}

function mealLabel(mealStatus: string): string {
	if (mealStatus === "BEFORE_MEAL") return "Take before meal";
	if (mealStatus === "AFTER_MEAL") return "Take after meal";
	if (mealStatus === "WITH_FOOD") return "Take with food";
	return "Any time";
}

export const NextDoseCard = ({
	nextDose,
	onTakeNow,
	isTaking,
}: NextDoseCardProps) => {
	if (!nextDose) {
		return (
			<View className="items-center gap-3 rounded-2xl border border-border-light bg-surface-light p-6 dark:border-border-dark dark:bg-surface-dark">
				<Ionicons
					name="checkmark-done-circle"
					size={48}
					className="text-success-light dark:text-success-dark"
				/>
				<Text className="font-medium text-base text-text-sub-light dark:text-text-sub-dark">
					All caught up for today!
				</Text>
			</View>
		);
	}

	return (
		<View className="mb-3 rounded-3xl border border-border-light bg-surface-light p-5 shadow-sm dark:border-border-dark dark:bg-surface-dark">
			<View className="mb-4 flex-row gap-4">
				<View className="h-14 w-14 items-center justify-center rounded-[18px] bg-cyan-50 dark:bg-cyan-950/30">
					<Ionicons name="medkit" size={28} className="text-primary" />
				</View>
				<View className="flex-1">
					<Text className="mb-1 font-bold text-2xl text-text-main-light dark:text-text-main-dark">
						{nextDose.genericName}
					</Text>
					<Text className="text-base text-text-sub-light dark:text-text-sub-dark">
						{nextDose.dosage} • {nextDose.form}
					</Text>
				</View>
				<View className="h-8 justify-center rounded-xl bg-orange-50 px-3 py-1.5 dark:bg-orange-950/30">
					<Text className="font-bold text-orange-600 text-sm dark:text-orange-400">
						{nextDose.timeOfDay}
					</Text>
				</View>
			</View>

			<View className="mb-5 flex-row items-center gap-2 rounded-xl bg-background-light p-3 dark:bg-background-dark">
				<Ionicons
					name="restaurant"
					size={18}
					className="text-text-sub-light dark:text-text-sub-dark"
				/>
				<Text className="text-sm text-text-main-light dark:text-text-main-dark">
					{mealLabel(nextDose.mealStatus)}
				</Text>
			</View>

			<TouchableOpacity
				className="flex-row items-center justify-center gap-2 rounded-2xl bg-primary py-4 shadow-lg"
				onPress={() => onTakeNow(nextDose)}
				disabled={isTaking}
			>
				{isTaking ? (
					<ActivityIndicator color="white" />
				) : (
					<>
						<Ionicons
							name="checkmark-circle"
							size={20}
							className="text-white"
						/>
						<Text className="font-bold text-lg text-white">Take Now</Text>
					</>
				)}
			</TouchableOpacity>
		</View>
	);
};
