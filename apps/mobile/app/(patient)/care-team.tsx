import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Modal,
	RefreshControl,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ConnectCodeModal } from "@/components/care-team/ConnectCodeModal";
import { useTRPC } from "@/lib/trpc";

const CARD =
	"mb-4 rounded-2xl border border-border-light bg-surface-light p-4 shadow-sm dark:border-border-dark dark:bg-surface-dark";
const AVATAR =
	"h-[50px] w-[50px] items-center justify-center rounded-full border border-border-light bg-surface-light dark:border-border-dark dark:bg-surface-dark";
const AVATAR_TEXT = "font-bold text-xl text-primary";
const CARD_TITLE =
	"font-bold text-lg text-text-main-light dark:text-text-main-dark";
const CARD_SUBTITLE = "text-sm text-text-sub-light dark:text-text-sub-dark";
const ACTION_BUTTON =
	"flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-2.5";
const SECTION_TITLE =
	"mb-3 font-bold text-lg text-text-main-light dark:text-text-main-dark";
const MODAL_BUTTON = "flex-1 items-center justify-center rounded-xl py-3";

export default function CareTeamScreen() {
	const router = useRouter();
	const trpc = useTRPC();

	const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
	const [isConnectVisible, setIsConnectVisible] = useState(false);
	const [inviteEmail, setInviteEmail] = useState("");

	// Queries
	const careTeamQuery = useQuery(trpc.careTeam.getMyCaregivers.queryOptions());
	const receivedInvitesQuery = useQuery(
		trpc.careTeam.getMyReceivedInvites.queryOptions(),
	);
	const sentInvitesQuery = useQuery(
		trpc.careTeam.getMySentInvites.queryOptions(),
	);

	// Mutations
	const inviteMutation = useMutation({
		...trpc.careTeam.inviteCaregiver.mutationOptions(),
		onSuccess: () => {
			Alert.alert("Success", "Invitation sent to caregiver.");
			setIsInviteModalVisible(false);
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
			careTeamQuery.refetch();
		},
		onError: (err) => {
			Alert.alert("Error", err.message);
		},
	});

	const handleCall = (name: string) => {
		Alert.alert("Calling", `Calling ${name}...`);
	};

	const handleInvite = () => {
		if (!inviteEmail) return;
		inviteMutation.mutate({ email: inviteEmail });
	};

	const onRefresh = () => {
		careTeamQuery.refetch();
		receivedInvitesQuery.refetch();
		sentInvitesQuery.refetch();
	};

	const isLoading =
		careTeamQuery.isLoading ||
		receivedInvitesQuery.isLoading ||
		sentInvitesQuery.isLoading;

	return (
		<SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
			{/* Header */}
			<View className="flex-row items-center justify-between border-border-light border-b px-5 py-4 dark:border-border-dark">
				<TouchableOpacity onPress={() => router.back()} className="p-2">
					<Ionicons
						name="arrow-back"
						size={24}
						className="text-text-main-light dark:text-text-main-dark"
					/>
				</TouchableOpacity>
				<Text className="font-bold text-text-main-light text-xl dark:text-text-main-dark">
					My Care Team
				</Text>
				<View className="flex-row items-center gap-2">
					<TouchableOpacity
						onPress={() => setIsConnectVisible(true)}
						className="rounded-full border border-primary p-2"
					>
						<Ionicons
							name="qr-code-outline"
							size={22}
							className="text-primary"
						/>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => setIsInviteModalVisible(true)}
						className="rounded-full bg-primary p-2"
					>
						<Ionicons name="add" size={24} className="text-white" />
					</TouchableOpacity>
				</View>
			</View>

			<ScrollView
				contentContainerClassName="p-5"
				refreshControl={
					<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
				}
			>
				{/* 1. Received Invites (Pending Requests) */}
				{receivedInvitesQuery.data && receivedInvitesQuery.data.length > 0 && (
					<View className="mb-6">
						<Text className={SECTION_TITLE}>Pending Requests</Text>
						{receivedInvitesQuery.data.map((invite) => (
							<View
								key={invite.id}
								className={`${CARD} border-2 border-primary`}
							>
								<View className="mb-4 flex-row items-center gap-4">
									<View className={AVATAR}>
										<Text className={AVATAR_TEXT}>
											{invite.caregiver.user.name?.[0] || "C"}
										</Text>
									</View>
									<View className="flex-1">
										<Text className={CARD_TITLE}>
											{invite.caregiver.user.name}
										</Text>
										<Text className={CARD_SUBTITLE}>Wants to connect</Text>
									</View>
								</View>
								<View className="flex-row gap-3">
									<TouchableOpacity
										className={`${ACTION_BUTTON} bg-error-light dark:bg-error-dark`}
										onPress={() =>
											respondMutation.mutate({
												inviteId: invite.id,
												status: "REJECTED",
											})
										}
									>
										<Text className="font-semibold text-sm text-white">
											Decline
										</Text>
									</TouchableOpacity>
									<TouchableOpacity
										className={`${ACTION_BUTTON} bg-success-light dark:bg-success-dark`}
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

				{/* 2. Active Caregivers */}
				<View className="mb-6">
					<Text className={SECTION_TITLE}>Active Caregivers</Text>
					{careTeamQuery.data?.length === 0 && (
						<Text className="text-base text-text-sub-light dark:text-text-sub-dark">
							No active caregivers.
						</Text>
					)}
					{careTeamQuery.data?.map((member) => (
						<View key={member.id} className={CARD}>
							<View className="mb-4 flex-row items-center gap-4">
								<View className={AVATAR}>
									<Text className={AVATAR_TEXT}>
										{member.caregiver.user.name?.[0] || "C"}
									</Text>
								</View>
								<View className="flex-1">
									<Text className={CARD_TITLE}>
										{member.caregiver.user.name}
									</Text>
									<Text className={CARD_SUBTITLE}>Caregiver</Text>
								</View>
							</View>

							<View className="flex-row gap-3">
								<TouchableOpacity
									className={ACTION_BUTTON}
									onPress={() =>
										handleCall(member.caregiver.user.name || "Caregiver")
									}
								>
									<Ionicons name="call" size={20} className="text-white" />
									<Text className="font-semibold text-sm text-white">Call</Text>
								</TouchableOpacity>
							</View>
						</View>
					))}
				</View>

				{/* 3. Sent Invites (Pending) */}
				{sentInvitesQuery.data && sentInvitesQuery.data.length > 0 && (
					<View className="mb-6">
						<Text className={SECTION_TITLE}>Sent Invitations</Text>
						{sentInvitesQuery.data.map((invite) => (
							<View key={invite.id} className={`${CARD} opacity-80`}>
								<View className="mb-4 flex-row items-center gap-4">
									<View className={`${AVATAR} bg-[#eee]`}>
										<Text className={`${AVATAR_TEXT} text-[#999]`}>
											{invite.caregiver.user.name?.[0] || "?"}
										</Text>
									</View>
									<View className="flex-1">
										<Text className={CARD_TITLE}>
											{invite.caregiver.user.name || invite.caregiverId}
										</Text>
										<Text className={CARD_SUBTITLE}>Pending Response</Text>
									</View>
								</View>
							</View>
						))}
					</View>
				)}
			</ScrollView>

			{/* Invite Modal */}
			<Modal
				visible={isInviteModalVisible}
				transparent
				animationType="slide"
				onRequestClose={() => setIsInviteModalVisible(false)}
			>
				<View className="flex-1 items-center justify-center bg-black/50 p-5">
					<View className="w-full max-w-[400px] rounded-3xl bg-surface-light p-6 dark:bg-surface-dark">
						<Text className="mb-2 font-bold text-text-main-light text-xl dark:text-text-main-dark">
							Add Caregiver
						</Text>
						<Text className="mb-6 text-sm text-text-sub-light dark:text-text-sub-dark">
							Enter the email address of the caregiver you want to invite.
						</Text>

						<TextInput
							className="mb-6 rounded-xl border border-border-light bg-background-light p-4 text-base text-text-main-light dark:border-border-dark dark:bg-background-dark dark:text-text-main-dark"
							placeholder="caregiver@example.com"
							placeholderTextColor="#9ca3af"
							value={inviteEmail}
							onChangeText={setInviteEmail}
							autoCapitalize="none"
							keyboardType="email-address"
						/>

						<View className="flex-row gap-3">
							<TouchableOpacity
								className={`${MODAL_BUTTON} border border-border-light bg-surface-light dark:border-border-dark dark:bg-surface-dark`}
								onPress={() => setIsInviteModalVisible(false)}
							>
								<Text className="font-semibold text-base text-text-main-light dark:text-text-main-dark">
									Cancel
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								className={`${MODAL_BUTTON} bg-primary`}
								onPress={handleInvite}
								disabled={inviteMutation.isPending}
							>
								{inviteMutation.isPending ? (
									<ActivityIndicator color="white" size="small" />
								) : (
									<Text className="font-semibold text-base text-white">
										Send Invite
									</Text>
								)}
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>

			<ConnectCodeModal
				visible={isConnectVisible}
				onClose={() => setIsConnectVisible(false)}
				onConnected={() => {
					careTeamQuery.refetch();
					receivedInvitesQuery.refetch();
					sentInvitesQuery.refetch();
				}}
			/>
		</SafeAreaView>
	);
}
