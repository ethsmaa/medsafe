import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/lib/react-query";
import { useTRPC } from "@/lib/trpc";

export default function CaregiverDashboard() {
	const trpc = useTRPC();
	const [inviteEmail, setInviteEmail] = useState("");
	const router = useRouter();

	const patientsQuery = useQuery(trpc.careTeam.getMyPatients.queryOptions());
	// TODO: Implement getPendingAlerts on backend
	const alertsQuery = { data: [] as { id: string; title: string }[] };

	// Mutations
	const inviteMutation = useMutation({
		...trpc.careTeam.invitePatient.mutationOptions(),
		onSuccess: () => {
			Alert.alert("Success", "Invitation sent successfully!");
			setInviteEmail("");
		},
		onError: (err) => {
			Alert.alert("Error", err.message);
		},
	});

	const handleInvite = () => {
		if (!inviteEmail) {
			Alert.alert("Error", "Please enter an email address");
			return;
		}
		inviteMutation.mutate({ patientEmail: inviteEmail });
	};

	const handleSignOut = async () => {
		try {
			await authClient.signOut();
			queryClient.clear(); // Force clear all cache
			router.replace("/(auth)/login");
		} catch (err) {
			console.error("Logout error:", err);
			router.replace("/(auth)/login");
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
			<ScrollView contentContainerClassName="p-6 pb-20">
				{/* Header */}
				<View className="mb-8 flex-row items-center justify-between">
					<View>
						<Text className="font-bold text-3xl text-text-main-light dark:text-text-main-dark">
							Dashboard
						</Text>
						<Text className="text-base text-text-sub-light dark:text-text-sub-dark">
							Manage your patients
						</Text>
					</View>
					<TouchableOpacity
						onPress={handleSignOut}
						className="rounded-full bg-surface-light p-3 shadow-sm dark:bg-surface-dark"
					>
						<Ionicons name="log-out-outline" size={24} color="#ef4444" />
					</TouchableOpacity>
				</View>

				{/* Stats Cards */}
				<View className="mb-8 flex-row gap-4">
					<View className="flex-1 rounded-2xl bg-surface-light p-5 shadow-sm dark:bg-surface-dark">
						<View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-primary/10">
							<Ionicons name="people" size={20} className="text-primary" />
						</View>
						<Text className="font-bold text-2xl text-text-main-light dark:text-text-main-dark">
							{patientsQuery.data?.length || 0}
						</Text>
						<Text className="text-sm text-text-sub-light dark:text-text-sub-dark">
							Active Patients
						</Text>
					</View>

					<View className="flex-1 rounded-2xl bg-surface-light p-5 shadow-sm dark:bg-surface-dark">
						<View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
							<Ionicons name="notifications" size={20} color="#ef4444" />
						</View>
						<Text className="font-bold text-2xl text-text-main-light dark:text-text-main-dark">
							{alertsQuery.data?.length || 0}
						</Text>
						<Text className="text-sm text-text-sub-light dark:text-text-sub-dark">
							Pending Alerts
						</Text>
					</View>
				</View>

				{/* Invite Section */}
				<View className="mb-8 rounded-2xl bg-surface-light p-6 shadow-sm dark:bg-surface-dark">
					<View className="mb-4 flex-row items-center gap-3">
						<View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
							<Ionicons name="person-add" size={20} className="text-primary" />
						</View>
						<View>
							<Text className="font-bold text-lg text-text-main-light dark:text-text-main-dark">
								Invite Patient
							</Text>
							<Text className="text-sm text-text-sub-light dark:text-text-sub-dark">
								Send an invitation via email
							</Text>
						</View>
					</View>

					<KeyboardAvoidingView
						behavior={Platform.OS === "ios" ? "padding" : "height"}
						className="gap-4"
					>
						<View className="gap-2">
							<Text className="font-medium text-sm text-text-main-light dark:text-text-main-dark">
								Patient Email
							</Text>
							<TextInput
								className="h-14 w-full rounded-xl border border-border-light bg-background-light px-4 text-text-main-light text-base shadow-sm focus:border-primary dark:border-border-dark dark:bg-background-dark dark:text-text-main-dark"
								placeholder="patient@example.com"
								value={inviteEmail}
								onChangeText={setInviteEmail}
								autoCapitalize="none"
								keyboardType="email-address"
								placeholderTextColor="#9ca3af"
							/>
						</View>

						<TouchableOpacity
							onPress={handleInvite}
							disabled={inviteMutation.isPending}
							className={`mt-2 h-14 w-full items-center justify-center rounded-xl bg-primary shadow-sm active:opacity-90 ${
								inviteMutation.isPending ? "opacity-70" : ""
							}`}
						>
							{inviteMutation.isPending ? (
								<ActivityIndicator color="white" />
							) : (
								<Text className="font-bold text-lg text-white">
									Send Invite
								</Text>
							)}
						</TouchableOpacity>
					</KeyboardAvoidingView>
				</View>

				{/* Quick Links */}
				<View className="gap-4">
					<Text className="font-bold text-lg text-text-main-light dark:text-text-main-dark">
						Quick Actions
					</Text>
					<TouchableOpacity
						onPress={() => router.push("/(caregiver)/(tabs)/patients")}
						className="flex-row items-center justify-between rounded-xl bg-surface-light p-4 shadow-sm active:bg-gray-50 dark:bg-surface-dark dark:active:bg-gray-800"
					>
						<View className="flex-row items-center gap-3">
							<View className="h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
								<Ionicons name="list" size={20} color="#3b82f6" />
							</View>
							<Text className="font-medium text-base text-text-main-light dark:text-text-main-dark">
								View All Patients
							</Text>
						</View>
						<Ionicons
							name="chevron-forward"
							size={20}
							className="text-text-sub-light dark:text-text-sub-dark"
						/>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={() => router.push("/(caregiver)/(tabs)/alerts")}
						className="flex-row items-center justify-between rounded-xl bg-surface-light p-4 shadow-sm active:bg-gray-50 dark:bg-surface-dark dark:active:bg-gray-800"
					>
						<View className="flex-row items-center gap-3">
							<View className="h-10 w-10 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-900/20">
								<Ionicons name="warning-outline" size={20} color="#f97316" />
							</View>
							<Text className="font-medium text-base text-text-main-light dark:text-text-main-dark">
								Check Alerts
							</Text>
						</View>
						<Ionicons
							name="chevron-forward"
							size={20}
							className="text-text-sub-light dark:text-text-sub-dark"
						/>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
