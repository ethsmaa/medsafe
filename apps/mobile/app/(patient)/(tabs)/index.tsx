import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	RefreshControl,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTRPC } from "@/lib/trpc";

import { AdherenceSummary } from "@/components/dashboard/AdherenceSummary";
import { DashboardInvite } from "@/components/dashboard/DashboardInvite";
import { TimelineItem } from "@/components/dashboard/TimelineItem";
import { useDashboardData } from "@/hooks/useDashboardData";
import {
	type ScheduleItem,
	useMedicationSchedule,
} from "@/hooks/useMedicationSchedule";

export default function PatientDashboard() {
	const router = useRouter();
	const {
		session,
		refreshing,
		refresh,
		invites,
		nextDose,
		schedule,
		flexibleItems,
		adherenceData,
		takeMedication,
		acceptInvite,
		isTaking,
		isAccepting,
	} = useDashboardData();

	return (
		<SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
			<View className="mb-6 flex-row items-center justify-between px-6 pt-2">
				<View>
					<Text className="font-semibold text-text-sub-light text-xs uppercase tracking-widest dark:text-text-sub-dark">
						Welcome Back
					</Text>
					<Text className="font-bold text-3xl text-text-main-light dark:text-text-main-dark">
						{session?.user?.name?.split(" ")[0] || "Patient"}
					</Text>
				</View>
				<TouchableOpacity
					onPress={() => router.push("/(patient)/(tabs)/profile")}
					className="h-10 w-10 items-center justify-center rounded-full bg-primary shadow-sm"
				>
					<Ionicons name="person" size={20} color="white" />
				</TouchableOpacity>
			</View>

			<ScrollView
				contentContainerClassName="px-6 pb-24"
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={refresh} />
				}
			>
				{/* Adherence Summary */}
				<AdherenceSummary
					taken={adherenceData.taken}
					total={adherenceData.total}
					percentage={adherenceData.percentage}
				/>

				{/* Pending Invites */}
				{invites.map((invite) => (
					<DashboardInvite
						key={invite.id}
						invite={invite}
						onAccept={acceptInvite}
						isAccepting={isAccepting}
					/>
				))}

				{/* NEXT DOSE - SIMPLE CARD (No complex Hero) */}
				<Text className="mb-4 mt-6 font-bold text-text-main-light text-xl dark:text-text-main-dark">
					Up Next
				</Text>

				{nextDose ? (
					<View className="mb-8 overflow-hidden rounded-2xl bg-primary shadow-md">
						<View className="p-6">
							<View className="flex-row items-start justify-between">
								<View>
									<Text className="font-semibold text-white/80 text-xs tracking-widest uppercase">
										Scheduled for{" "}
										{format(new Date(nextDose.scheduledTime), "h:mm a")}
									</Text>
									<Text className="mt-1 font-bold text-3xl text-white">
										{nextDose.medication?.name ||
											nextDose.genericName ||
											"Medication"}
									</Text>
									<Text className="text-white/90 text-lg">
										{nextDose.medication?.dosage ||
											nextDose.dosage ||
											"No dosage info"}
									</Text>
								</View>
								<View className="rounded-full bg-white/20 p-3">
									<Ionicons name="medkit" size={24} color="white" />
								</View>
							</View>

							<TouchableOpacity
								onPress={() =>
									takeMedication(nextDose.prescriptionMedicationId)
								}
								disabled={isTaking}
								className="mt-6 flex-row items-center justify-center rounded-xl bg-white p-4 active:opacity-90"
							>
								{isTaking ? (
									<View>
										<Text className="font-bold text-primary">Recording...</Text>
									</View>
								) : (
									<>
										<Ionicons
											name="checkmark-circle"
											size={20}
											color="#d99696"
										/>
										<Text className="ml-2 font-bold text-primary">
											Take Now
										</Text>
									</>
								)}
							</TouchableOpacity>
						</View>
					</View>
				) : (
					<View className="mb-8 items-center justify-center rounded-2xl bg-surface-light p-8 shadow-sm dark:bg-surface-dark">
						<Ionicons name="sunny" size={48} color="#fbbf24" />
						<Text className="mt-4 font-bold text-lg text-text-main-light dark:text-text-main-dark">
							All Caught Up!
						</Text>
						<Text className="text-center text-text-sub-light dark:text-text-sub-dark">
							No medications scheduled for right now.
						</Text>
					</View>
				)}

				{/* Timeline */}
				<View className="mt-2 mb-4 flex-row items-center justify-between">
					<Text className="font-bold text-text-main-light text-xl dark:text-text-main-dark">
						Today's Schedule
					</Text>
					<TouchableOpacity
						onPress={() => router.push("/(patient)/(tabs)/calendar")}
					>
						<Text className="font-bold text-base text-primary">See all</Text>
					</TouchableOpacity>
				</View>

				{schedule.length === 0 ? (
					<Text className="py-8 text-center text-gray-500 italic">
						No scheduled medications for today.
					</Text>
				) : (
					<View className="gap-y-0 relative">
						{/* Continuous vertical line background if needed, but handled per item for now */}
						{schedule.map((item: ScheduleItem, index: number) => (
							<TimelineItem
								key={item.prescriptionMedicationId + item.scheduledTime}
								item={item}
								isNext={nextDose?.id === item.id}
								isLast={index === schedule.length - 1}
							/>
						))}
					</View>
				)}

				{/* Flexible Items */}
				{flexibleItems && flexibleItems.length > 0 && (
					<View className="mt-8">
						<Text className="mb-4 font-bold text-text-main-light text-xl dark:text-text-main-dark">
							As Needed
						</Text>
						<View className="gap-y-2">
							{flexibleItems.map((item: ScheduleItem) => (
								<TimelineItem key={item.prescriptionMedicationId} item={item} />
							))}
						</View>
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}
