import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import type { IconName } from "@/lib/medication-display";

interface MedicationDetailHeroProps {
	iconName: IconName;
	name: string;
	generic: string | null;
	dosage: string;
}

export const MedicationDetailHero = ({
	iconName,
	name,
	generic,
	dosage,
}: MedicationDetailHeroProps) => (
	<View className="mb-4 items-center rounded-[20px] bg-surface-light p-6 shadow-sm dark:bg-surface-dark">
		<View className="mb-3 h-[72px] w-[72px] items-center justify-center rounded-full bg-primary-soft-light dark:bg-primary-soft-dark">
			<Ionicons name={iconName} size={32} className="text-primary" />
		</View>
		<Text className="mb-1 text-center font-extrabold text-2xl text-text-main-light dark:text-text-main-dark">
			{name}
		</Text>
		{generic ? (
			<Text className="mb-3 text-sm text-text-sub-light dark:text-text-sub-dark">
				{generic}
			</Text>
		) : null}
		<View className="rounded-2xl bg-primary-soft-light px-4 py-1.5 dark:bg-primary-soft-dark">
			<Text className="font-bold text-primary text-sm">{dosage}</Text>
		</View>
	</View>
);
