import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
	ActivityIndicator,
	FlatList,
	RefreshControl,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTRPC } from "@/lib/trpc";

export default function PatientsScreen() {
	const router = useRouter();
	const trpc = useTRPC();

	const patientsQuery = useQuery(trpc.careTeam.getMyPatients.queryOptions());

	const onRefresh = async () => {
		await patientsQuery.refetch();
	};

	return (
		<SafeAreaView
			className="flex-1 bg-background-light dark:bg-background-dark"
			edges={["top"]}
		>
			<View className="bg-background-light p-4 dark:bg-background-dark">
				<Text className="font-bold text-2xl text-text-main-light dark:text-text-main-dark">
					All Patients
				</Text>
			</View>

			{patientsQuery.isLoading ? (
				<ActivityIndicator size="large" color="#d99696" />
			) : patientsQuery.data?.length === 0 ? (
				<View className="flex-1 items-center justify-center">
					<Text className="text-base text-text-sub-light dark:text-text-sub-dark">
						No active patients yet.
					</Text>
				</View>
			) : (
				<FlatList
					data={patientsQuery.data}
					keyExtractor={(item) => item.id}
					contentContainerClassName="gap-3 p-4"
					refreshControl={
						<RefreshControl
							refreshing={patientsQuery.isLoading}
							onRefresh={onRefresh}
						/>
					}
					renderItem={({ item }) => (
						<View className="mb-3 flex-row items-center justify-between rounded-xl border border-border-light bg-surface-light p-4 shadow-sm dark:border-border-dark dark:bg-surface-dark">
							<View>
								<Text className="font-semibold text-base text-text-main-light dark:text-text-main-dark">
									{item.patient.user.name || "Unknown"}
								</Text>
								<Text className="text-sm text-text-sub-light dark:text-text-sub-dark">
									{item.patient.user.email}
								</Text>
							</View>
							<TouchableOpacity
								className="rounded-lg bg-blue-50 px-4 py-2 dark:bg-blue-950/40"
								onPress={() =>
									router.push(`/(caregiver)/patient/${item.patient.id}`)
								}
							>
								<Text className="font-semibold text-primary text-sm">View</Text>
							</TouchableOpacity>
						</View>
					)}
				/>
			)}
		</SafeAreaView>
	);
}
