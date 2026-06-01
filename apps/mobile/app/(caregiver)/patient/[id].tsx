import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
	ActivityIndicator,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "@/context/LanguageContext";
import { useTRPC } from "@/lib/trpc";

const CARD_SHADOW = "shadow-sm";

export default function PatientDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const trpc = useTRPC();
	const { t } = useLanguage();

	const patientQuery = useQuery(
		trpc.careTeam.getPatientData.queryOptions({ patientId: id! }),
	);

	if (patientQuery.isLoading) {
		return (
			<SafeAreaView className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
				<ActivityIndicator size="large" color="#d99696" />
			</SafeAreaView>
		);
	}

	if (patientQuery.error || !patientQuery.data) {
		return (
			<SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
				<Text className="mt-5 text-center text-base text-error-light dark:text-error-dark">
					{t("validation.error")}
				</Text>
			</SafeAreaView>
		);
	}

	const patient = patientQuery.data;

	// Flatten all intake events for the "Recent Activity" section
	const allLogs = patient.prescriptions
		.flatMap((p) =>
			p.intakeEvents.map((e) => ({
				...e,
				medicationName: p.medication.nameBrand || p.medication.nameGeneric,
			})),
		)
		.sort(
			(a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime(),
		)
		.slice(0, 10);

	return (
		<SafeAreaView
			className="flex-1 bg-background-light dark:bg-background-dark"
			edges={["bottom"]}
		>
			<Stack.Screen
				options={{
					headerShown: true,
					title: patient.user.name || t("cg.patientDetails"),
					headerBackTitle: t("cg.dashboard"),
				}}
			/>
			<ScrollView contentContainerClassName="p-4 pb-10">
				{/* Patient Info Card */}
				<View
					className={`mb-6 flex-row items-center rounded-3xl bg-surface-light p-5 dark:bg-surface-dark ${CARD_SHADOW}`}
				>
					<View className="h-[60px] w-[60px] items-center justify-center rounded-full bg-primary-soft-light dark:bg-primary-soft-dark">
						<Text className="font-extrabold text-2xl text-primary">
							{(patient.user.name?.[0] || "P").toUpperCase()}
						</Text>
					</View>
					<View className="ml-4 flex-1">
						<Text className="font-bold text-text-main-light text-xl dark:text-text-main-dark">
							{patient.user.name}
						</Text>
						<Text className="text-sm text-text-sub-light dark:text-text-sub-dark">
							{patient.user.email}
						</Text>
					</View>
					<TouchableOpacity
						className="h-11 w-11 items-center justify-center rounded-full bg-primary shadow-sm"
						onPress={() =>
							router.push(`/(caregiver)/add-medication?patientId=${id}`)
						}
					>
						<Ionicons name="add" size={24} className="text-white" />
					</TouchableOpacity>
				</View>

				{/* Medications Section */}
				<View className="mb-3 ml-1 flex-row items-center">
					<Ionicons name="medical" size={20} className="text-primary" />
					<Text className="ml-2 font-extrabold text-lg text-text-main-light dark:text-text-main-dark">
						{t("cg.medications")}
					</Text>
				</View>

				{patient.prescriptions.length === 0 ? (
					<View className="mb-6 items-center justify-center rounded-2xl border border-border-light border-dashed bg-surface-light p-6 dark:border-border-dark dark:bg-surface-dark">
						<Text className="text-text-sub-light dark:text-text-sub-dark">
							{t("cg.noMedications")}
						</Text>
					</View>
				) : (
					<View className="mb-6 gap-3">
						{patient.prescriptions.map((p) => (
							<View
								key={p.id}
								className={`flex-row items-center rounded-2xl bg-surface-light p-4 dark:bg-surface-dark ${CARD_SHADOW}`}
							>
								<View className="h-12 w-12 items-center justify-center rounded-xl bg-primary-soft-light dark:bg-primary-soft-dark">
									<Ionicons name="medkit" size={24} className="text-primary" />
								</View>
								<View className="ml-3 flex-1">
									<Text
										className="font-bold text-base text-text-main-light dark:text-text-main-dark"
										numberOfLines={1}
									>
										{p.medication.nameBrand || p.medication.nameGeneric}
									</Text>
									<Text className="mt-0.5 text-text-sub-light text-xs dark:text-text-sub-dark">
										{p.dosageAmount} • {p.frequency}
									</Text>
								</View>
								<TouchableOpacity
									onPress={() =>
										router.push({
											pathname: "/(caregiver)/add-medication",
											params: { id: p.id, patientId: id },
										})
									}
									className="p-1"
								>
									<Ionicons
										name="chevron-forward"
										size={20}
										className="text-text-sub-light dark:text-text-sub-dark"
									/>
								</TouchableOpacity>
							</View>
						))}
					</View>
				)}

				{/* Recent Activity Log */}
				<View className="mb-3 ml-1 flex-row items-center">
					<Ionicons name="list" size={20} className="text-primary" />
					<Text className="ml-2 font-extrabold text-lg text-text-main-light dark:text-text-main-dark">
						{t("log.title")}
					</Text>
				</View>

				{allLogs.length === 0 ? (
					<View className="mb-6 items-center justify-center rounded-2xl border border-border-light border-dashed bg-surface-light p-6 dark:border-border-dark dark:bg-surface-dark">
						<Text className="text-text-sub-light dark:text-text-sub-dark">
							{t("log.empty")}
						</Text>
					</View>
				) : (
					<View
						className={`rounded-2xl bg-surface-light p-2 dark:bg-surface-dark ${CARD_SHADOW}`}
					>
						{allLogs.map((log) => (
							<View
								key={log.id}
								className="flex-row items-center border-border-light border-b p-3 dark:border-border-dark"
							>
								<View
									className={`mr-3 h-2 w-2 rounded-full ${
										log.status === "TAKEN"
											? "bg-green-500"
											: log.status === "SKIPPED"
												? "bg-yellow-500"
												: "bg-red-500"
									}`}
								/>
								<View className="flex-1">
									<Text className="font-semibold text-sm text-text-main-light dark:text-text-main-dark">
										{log.medicationName}
									</Text>
									<Text className="mt-0.5 text-text-sub-light text-xs dark:text-text-sub-dark">
										{new Date(log.takenAt).toLocaleString()}
									</Text>
								</View>
								<Text
									className={`font-bold text-xs ${
										log.status === "TAKEN"
											? "text-green-600 dark:text-green-400"
											: log.status === "SKIPPED"
												? "text-yellow-600 dark:text-yellow-400"
												: "text-red-600 dark:text-red-400"
									}`}
								>
									{t(
										log.status === "TAKEN"
											? "log.statusTaken"
											: log.status === "SKIPPED"
												? "log.statusSkipped"
												: "log.statusMissed",
									)}
								</Text>
							</View>
						))}
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}
