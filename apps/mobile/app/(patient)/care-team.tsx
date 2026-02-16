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
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import { useAccessibility } from "@/context/AccessibilityContext";
import { useTRPC } from "@/lib/trpc";

export default function CareTeamScreen() {
	const router = useRouter();
	const trpc = useTRPC();
	const { isHighContrast, textSize } = useAccessibility();
	const styles = makeStyles(isHighContrast, textSize);

	const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
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
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.backButton}
				>
					<Ionicons
						name="arrow-back"
						size={24}
						color={styles.headerTitle.color}
					/>
				</TouchableOpacity>
				<Text style={styles.headerTitle}>My Care Team</Text>
				<TouchableOpacity
					onPress={() => setIsInviteModalVisible(true)}
					style={styles.addButton}
				>
					<Ionicons name="add" size={24} color="white" />
				</TouchableOpacity>
			</View>

			<ScrollView
				contentContainerStyle={styles.content}
				refreshControl={
					<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
				}
			>
				{/* 1. Received Invites (Pending Requests) */}
				{receivedInvitesQuery.data && receivedInvitesQuery.data.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Pending Requests</Text>
						{receivedInvitesQuery.data.map((invite) => (
							<View key={invite.id} style={[styles.card, styles.inviteCard]}>
								<View style={styles.cardHeader}>
									<View style={styles.avatar}>
										<Text style={styles.avatarText}>
											{invite.caregiver.user.name?.[0] || "C"}
										</Text>
									</View>
									<View style={{ flex: 1 }}>
										<Text style={styles.cardTitle}>
											{invite.caregiver.user.name}
										</Text>
										<Text style={styles.cardSubtitle}>Wants to connect</Text>
									</View>
								</View>
								<View style={styles.cardActions}>
									<TouchableOpacity
										style={[styles.actionButton, styles.rejectButton]}
										onPress={() =>
											respondMutation.mutate({
												inviteId: invite.id,
												status: "REJECTED",
											})
										}
									>
										<Text style={styles.rejectButtonText}>Decline</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={[styles.actionButton, styles.acceptButton]}
										onPress={() =>
											respondMutation.mutate({
												inviteId: invite.id,
												status: "ACTIVE",
											})
										}
									>
										<Text style={styles.acceptButtonText}>Accept</Text>
									</TouchableOpacity>
								</View>
							</View>
						))}
					</View>
				)}

				{/* 2. Active Caregivers */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Active Caregivers</Text>
					{careTeamQuery.data?.length === 0 && (
						<Text style={styles.emptyText}>No active caregivers.</Text>
					)}
					{careTeamQuery.data?.map((member) => (
						<View key={member.id} style={styles.card}>
							<View style={styles.cardHeader}>
								<View style={styles.avatar}>
									<Text style={styles.avatarText}>
										{member.caregiver.user.name?.[0] || "C"}
									</Text>
								</View>
								<View style={{ flex: 1 }}>
									<Text style={styles.cardTitle}>
										{member.caregiver.user.name}
									</Text>
									<Text style={styles.cardSubtitle}>Caregiver</Text>
								</View>
							</View>

							<View style={styles.cardActions}>
								<TouchableOpacity
									style={styles.actionButton}
									onPress={() =>
										handleCall(member.caregiver.user.name || "Caregiver")
									}
								>
									<Ionicons name="call" size={20} color="white" />
									<Text style={styles.actionButtonText}>Call</Text>
								</TouchableOpacity>
							</View>
						</View>
					))}
				</View>

				{/* 3. Sent Invites (Pending) */}
				{sentInvitesQuery.data && sentInvitesQuery.data.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Sent Invitations</Text>
						{sentInvitesQuery.data.map((invite) => (
							<View key={invite.id} style={[styles.card, { opacity: 0.8 }]}>
								<View style={styles.cardHeader}>
									<View style={[styles.avatar, { backgroundColor: "#eee" }]}>
										<Text style={[styles.avatarText, { color: "#999" }]}>
											{invite.caregiver.user.name?.[0] || "?"}
										</Text>
									</View>
									<View style={{ flex: 1 }}>
										<Text style={styles.cardTitle}>
											{invite.caregiver.user.name || invite.caregiverId}
										</Text>
										<Text style={styles.cardSubtitle}>Pending Response</Text>
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
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Add Caregiver</Text>
						<Text style={styles.modalSubtitle}>
							Enter the email address of the caregiver you want to invite.
						</Text>

						<TextInput
							style={styles.input}
							placeholder="caregiver@example.com"
							value={inviteEmail}
							onChangeText={setInviteEmail}
							autoCapitalize="none"
							keyboardType="email-address"
						/>

						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={[styles.modalButton, styles.cancelButton]}
								onPress={() => setIsInviteModalVisible(false)}
							>
								<Text style={styles.cancelButtonText}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.modalButton, styles.confirmButton]}
								onPress={handleInvite}
								disabled={inviteMutation.isPending}
							>
								{inviteMutation.isPending ? (
									<ActivityIndicator color="white" size="small" />
								) : (
									<Text style={styles.confirmButtonText}>Send Invite</Text>
								)}
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

const makeStyles = (isHighContrast: boolean, textSize: number) => {
	const theme = isHighContrast ? Colors.highContrast : Colors.light;
	return StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.background,
		},
		header: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			paddingHorizontal: 20,
			paddingVertical: 16,
			borderBottomWidth: 1,
			borderBottomColor: theme.border,
		},
		backButton: {
			padding: 8,
		},
		headerTitle: {
			fontSize: 20 * textSize,
			fontWeight: "bold",
			color: theme.text,
		},
		addButton: {
			backgroundColor: theme.primary,
			padding: 8,
			borderRadius: 20,
		},
		content: {
			padding: 20,
		},
		emptyState: {
			alignItems: "center",
			justifyContent: "center",
			marginTop: 60,
			gap: 16,
		},
		emptyText: {
			fontSize: 16 * textSize,
			color: theme.textSecondary,
		},
		emptyButton: {
			backgroundColor: theme.primary,
			paddingHorizontal: 20,
			paddingVertical: 12,
			borderRadius: 24,
		},
		emptyButtonText: {
			color: "white",
			fontWeight: "600",
			fontSize: 16 * textSize,
		},
		card: {
			backgroundColor: theme.cardBg,
			borderRadius: 16,
			padding: 16,
			marginBottom: 16,
			borderWidth: isHighContrast ? 2 : 1,
			borderColor: theme.border,
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.05,
			shadowRadius: 8,
			elevation: 2,
		},
		cardHeader: {
			flexDirection: "row",
			alignItems: "center",
			gap: 16,
			marginBottom: 16,
		},
		avatar: {
			width: 50,
			height: 50,
			borderRadius: 25,
			backgroundColor: theme.cardBg,
			alignItems: "center",
			justifyContent: "center",
			borderWidth: 1,
			borderColor: theme.border,
		},
		avatarText: {
			fontSize: 20 * textSize,
			fontWeight: "bold",
			color: theme.primary,
		},
		cardTitle: {
			fontSize: 18 * textSize,
			fontWeight: "bold",
			color: theme.text,
		},
		cardSubtitle: {
			fontSize: 14 * textSize,
			color: theme.textSecondary,
		},
		cardActions: {
			flexDirection: "row",
			gap: 12,
		},
		actionButton: {
			flex: 1,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: theme.primary,
			paddingVertical: 10,
			borderRadius: 12,
			gap: 8,
		},
		actionButtonText: {
			color: "white",
			fontWeight: "600",
			fontSize: 14 * textSize,
		},
		// Modal
		modalOverlay: {
			flex: 1,
			backgroundColor: "rgba(0,0,0,0.5)",
			justifyContent: "center",
			alignItems: "center",
			padding: 20,
		},
		modalContent: {
			backgroundColor: theme.cardBg,
			borderRadius: 24,
			padding: 24,
			width: "100%",
			maxWidth: 400,
		},
		modalTitle: {
			fontSize: 20 * textSize,
			fontWeight: "bold",
			color: theme.text,
			marginBottom: 8,
		},
		modalSubtitle: {
			fontSize: 14 * textSize,
			color: theme.textSecondary,
			marginBottom: 24,
		},
		input: {
			backgroundColor: theme.background,
			borderRadius: 12,
			padding: 16,
			fontSize: 16 * textSize,
			color: theme.text,
			marginBottom: 24,
			borderWidth: 1,
			borderColor: theme.border,
		},
		modalButtons: {
			flexDirection: "row",
			gap: 12,
		},
		modalButton: {
			flex: 1,
			paddingVertical: 12,
			borderRadius: 12,
			alignItems: "center",
			justifyContent: "center",
		},
		cancelButton: {
			backgroundColor: theme.cardBg,
			borderWidth: 1,
			borderColor: theme.border,
		},
		confirmButton: {
			backgroundColor: theme.primary,
		},
		cancelButtonText: {
			color: theme.text,
			fontWeight: "600",
			fontSize: 16 * textSize,
		},
		confirmButtonText: {
			color: "white",
			fontWeight: "600",
			fontSize: 16 * textSize,
		},
		section: {
			marginBottom: 24,
		},
		sectionTitle: {
			fontSize: 18 * textSize,
			fontWeight: "bold",
			color: theme.text,
			marginBottom: 12,
		},
		inviteCard: {
			borderWidth: 2,
			borderColor: theme.primary, // Highlight pending invites
		},
		rejectButton: {
			backgroundColor: theme.error, // Red
		},
		rejectButtonText: {
			color: "white",
			fontWeight: "600",
			fontSize: 14 * textSize,
		},
		acceptButton: {
			backgroundColor: theme.success, // Green
		},
		acceptButtonText: {
			color: "white",
			fontWeight: "600",
			fontSize: 14 * textSize,
		},
	});
};
