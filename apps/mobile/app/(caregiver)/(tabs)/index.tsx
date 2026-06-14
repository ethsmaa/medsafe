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
import { ConnectCodeModal } from "@/components/care-team/ConnectCodeModal";
import { useLanguage } from "@/context/LanguageContext";
import { authClient } from "@/lib/auth-client";
import { logger } from "@/lib/logger";
import { queryClient } from "@/lib/react-query";
import { useTRPC } from "@/lib/trpc";
import { useActivityLogStore } from "@/stores/activityLogStore";

export default function CaregiverDashboard() {
	const trpc = useTRPC();
	const { t } = useLanguage();
	const [inviteEmail, setInviteEmail] = useState("");
	const [isConnectVisible, setIsConnectVisible] = useState(false);
	const router = useRouter();

	const patientsQuery = useQuery(trpc.careTeam.getMyPatients.queryOptions());
	const logQuery = useQuery(trpc.careTeam.getActivityLog.queryOptions());
	const receivedInvitesQuery = useQuery(
		trpc.careTeam.getCaregiverReceivedInvites.queryOptions(),
	);
	const sentInvitesQuery = useQuery(
		trpc.careTeam.getCaregiverSentInvites.queryOptions(),
	);
	const allLogEntries = (logQuery.data ?? []) as Array<{ id: string }>;
	const { getUnreadCount } = useActivityLogStore();
	const pendingCount = getUnreadCount(allLogEntries);

	// Mutations
	const inviteMutation = useMutation({
		...trpc.careTeam.invitePatient.mutationOptions(),
		onSuccess: () => {
			Alert.alert("Success", "Invitation sent successfully!");
			setInviteEmail("");
			sentInvitesQuery.refetch();
		},
		onError: (err) => {
			Alert.alert("Error", err.message);
		},
	});

	const respondMutation = useMutation({
		...trpc.careTeam.respondToInvite.mutationOptions(),
		onSuccess: () => {
			receivedInvitesQuery.refetch();
			patientsQuery.refetch();
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
			logger.error("Logout error:", err);
			router.replace("/(auth)/login");
		}
	};

	return (
		<SafeAreaView
			className="flex-1 bg-background-light dark:bg-background-dark"
			edges={["top"]}
		>
			<ScrollView contentContainerClassName="p-6 pb-20">
				{/* Header */}
				<View className="mb-8 flex-row items-center justify-between">
					<View>
						<Text className="font-bold text-3xl text-text-main-light dark:text-text-main-dark">
							{t("cg.dashboard")}
						</Text>
						<Text className="text-base text-text-sub-light dark:text-text-sub-dark">
							{t("cg.managePatients")}
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
					<TouchableOpacity
						className="flex-1 rounded-2xl bg-surface-light p-5 shadow-sm active:opacity-80 dark:bg-surface-dark"
						onPress={() => router.push("/(caregiver)/(tabs)/patients")}
					>
						<View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-primary/10">
							<Ionicons name="people" size={20} className="text-primary" />
						</View>
						<Text className="font-bold text-2xl text-text-main-light dark:text-text-main-dark">
							{patientsQuery.data?.length || 0}
						</Text>
						<Text className="text-sm text-text-sub-light dark:text-text-sub-dark">
							{t("cg.activePatients")}
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						className="flex-1 rounded-2xl bg-surface-light p-5 shadow-sm active:opacity-80 dark:bg-surface-dark"
						onPress={() => router.push("/(caregiver)/(tabs)/alerts")}
					>
						<View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
							<Ionicons name="notifications" size={20} color="#ef4444" />
						</View>
						<Text className="font-bold text-2xl text-text-main-light dark:text-text-main-dark">
							{pendingCount}
						</Text>
						<Text className="text-sm text-text-sub-light dark:text-text-sub-dark">
							{t("cg.pendingAlerts")}
						</Text>
					</TouchableOpacity>
				</View>

				{/* Care Team Requests (invites received from patients) */}
				{receivedInvitesQuery.data && receivedInvitesQuery.data.length > 0 && (
					<View className="mb-8">
						<Text className="mb-3 font-bold text-lg text-text-main-light dark:text-text-main-dark">
							Care Team Requests
						</Text>
						{receivedInvitesQuery.data.map((invite) => (
							<View
								key={invite.id}
								className="mb-3 rounded-2xl border-2 border-primary bg-surface-light p-4 shadow-sm dark:bg-surface-dark"
							>
								<View className="mb-3 flex-row items-center gap-3">
									<View className="h-12 w-12 items-center justify-center rounded-full bg-primary/10">
										<Text className="font-bold text-primary text-xl">
											{invite.patient.user.name?.[0] || "P"}
										</Text>
									</View>
									<View className="flex-1">
										<Text className="font-bold text-base text-text-main-light dark:text-text-main-dark">
											{invite.patient.user.name || invite.patient.user.email}
										</Text>
										<Text className="text-sm text-text-sub-light dark:text-text-sub-dark">
											Wants you on their care team
										</Text>
									</View>
								</View>
								<View className="flex-row gap-3">
									<TouchableOpacity
										className="flex-1 items-center justify-center rounded-xl border border-border-light py-2.5 dark:border-border-dark"
										disabled={respondMutation.isPending}
										onPress={() =>
											respondMutation.mutate({
												inviteId: invite.id,
												status: "REJECTED",
											})
										}
									>
										<Text className="font-semibold text-sm text-text-main-light dark:text-text-main-dark">
											Decline
										</Text>
									</TouchableOpacity>
									<TouchableOpacity
										className="flex-1 items-center justify-center rounded-xl bg-primary py-2.5"
										disabled={respondMutation.isPending}
										onPress={() =>
											respondMutation.mutate({
												inviteId: invite.id,
												status: "ACTIVE",
											})
										}
									>
										<Text className="font-semibold text-sm text-white">
											Accept
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						))}
					</View>
				)}

				{/* Invite Section */}
				<View className="mb-8 rounded-2xl bg-surface-light p-6 shadow-sm dark:bg-surface-dark">
					<View className="mb-4 flex-row items-center gap-3">
						<View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
							<Ionicons name="person-add" size={20} className="text-primary" />
						</View>
						<View>
							<Text className="font-bold text-lg text-text-main-light dark:text-text-main-dark">
								{t("cg.invitePatient")}
							</Text>
							<Text className="text-sm text-text-sub-light dark:text-text-sub-dark">
								{t("cg.inviteDesc")}
							</Text>
						</View>
					</View>

					<KeyboardAvoidingView
						behavior={Platform.OS === "ios" ? "padding" : "height"}
						className="gap-4"
					>
						<View className="gap-2">
							<Text className="font-medium text-sm text-text-main-light dark:text-text-main-dark">
								{t("cg.patientEmail")}
							</Text>
							<TextInput
								className="h-14 w-full rounded-xl border border-border-light bg-background-light px-4 text-base text-text-main-light shadow-sm focus:border-primary dark:border-border-dark dark:bg-background-dark dark:text-text-main-dark"
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
									{t("cg.sendInvite")}
								</Text>
							)}
						</TouchableOpacity>
					</KeyboardAvoidingView>
				</View>

				{/* Connect with QR / code */}
				<TouchableOpacity
					onPress={() => setIsConnectVisible(true)}
					className="mb-8 flex-row items-center justify-center gap-2 rounded-2xl border border-primary bg-surface-light p-4 shadow-sm dark:bg-surface-dark"
				>
					<Ionicons name="qr-code-outline" size={20} className="text-primary" />
					<Text className="font-semibold text-base text-primary">
						Connect with QR / code
					</Text>
				</TouchableOpacity>

				{/* Pending sent invitations */}
				{sentInvitesQuery.data && sentInvitesQuery.data.length > 0 && (
					<View className="mb-8">
						<Text className="mb-3 font-bold text-lg text-text-main-light dark:text-text-main-dark">
							Pending Invitations
						</Text>
						{sentInvitesQuery.data.map((invite) => (
							<View
								key={invite.id}
								className="mb-3 flex-row items-center gap-3 rounded-2xl bg-surface-light p-4 opacity-80 shadow-sm dark:bg-surface-dark"
							>
								<View className="h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
									<Ionicons name="time-outline" size={20} color="#9ca3af" />
								</View>
								<View className="flex-1">
									<Text className="font-semibold text-base text-text-main-light dark:text-text-main-dark">
										{invite.patient.user.name || invite.patient.user.email}
									</Text>
									<Text className="text-sm text-text-sub-light dark:text-text-sub-dark">
										Waiting for response
									</Text>
								</View>
							</View>
						))}
					</View>
				)}

				{/* Quick Links */}
				<View className="gap-4">
					<Text className="font-bold text-lg text-text-main-light dark:text-text-main-dark">
						{t("cg.quickActions")}
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
								{t("cg.viewAllPatients")}
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
								{t("cg.checkAlerts")}
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

			<ConnectCodeModal
				visible={isConnectVisible}
				onClose={() => setIsConnectVisible(false)}
				onConnected={() => {
					patientsQuery.refetch();
					receivedInvitesQuery.refetch();
					sentInvitesQuery.refetch();
				}}
			/>
		</SafeAreaView>
	);
}
