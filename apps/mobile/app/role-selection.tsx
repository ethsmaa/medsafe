import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@/hooks/use-user";
import { useTRPC } from "@/lib/trpc";

export default function RoleSelectionScreen() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [selectedRole, setSelectedRole] = useState<
		"PATIENT" | "CAREGIVER" | null
	>(null);

	const { data: user } = useUser();

	const setupRoleMutation = useMutation({
		...trpc.user.setupRole.mutationOptions(),
		onSuccess: async (data) => {
			console.log("Setup Role Success:", data);
			await queryClient.invalidateQueries({
				queryKey: trpc.user.getProfile.queryOptions({ userId: user?.id })
					.queryKey,
			});
			// Force check
			console.log("Invalidated queries");
		},
		onError: (err) => {
			console.error("Setup Role Error:", err);
			Alert.alert("Error", err.message);
		},
	});

	const handleConfirm = () => {
		if (!selectedRole) return;
		setupRoleMutation.mutate({ role: selectedRole });
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Welcome to MedSafe</Text>
				<Text style={styles.subtitle}>
					Please choose your role to continue.
				</Text>
			</View>

			<View style={styles.cardsContainer}>
				<TouchableOpacity
					style={[
						styles.card,
						selectedRole === "PATIENT" && styles.cardSelected,
					]}
					onPress={() => setSelectedRole("PATIENT")}
					activeOpacity={0.8}
				>
					<Text style={styles.cardIcon}>👤</Text>
					<View>
						<Text
							style={[
								styles.cardTitle,
								selectedRole === "PATIENT" && styles.textSelected,
							]}
						>
							I am a Patient
						</Text>
						<Text
							style={[
								styles.cardDescription,
								selectedRole === "PATIENT" && styles.textSelected,
							]}
						>
							Manage my own medications
						</Text>
					</View>
				</TouchableOpacity>

				<TouchableOpacity
					style={[
						styles.card,
						selectedRole === "CAREGIVER" && styles.cardSelected,
					]}
					onPress={() => setSelectedRole("CAREGIVER")}
					activeOpacity={0.8}
				>
					<Text style={styles.cardIcon}>🩺</Text>
					<View>
						<Text
							style={[
								styles.cardTitle,
								selectedRole === "CAREGIVER" && styles.textSelected,
							]}
						>
							I am a Caregiver
						</Text>
						<Text
							style={[
								styles.cardDescription,
								selectedRole === "CAREGIVER" && styles.textSelected,
							]}
						>
							Manage for others
						</Text>
					</View>
				</TouchableOpacity>
			</View>

			<View style={styles.footer}>
				<TouchableOpacity
					style={[
						styles.button,
						!selectedRole && styles.buttonDisabled,
						setupRoleMutation.isPending && styles.buttonDisabled,
					]}
					disabled={!selectedRole || setupRoleMutation.isPending}
					onPress={handleConfirm}
				>
					<Text style={styles.buttonText}>
						{setupRoleMutation.isPending ? "Setting up..." : "Continue"}
					</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f3f4f6", // gray-100
		padding: 24,
	},
	header: {
		marginTop: 40,
		marginBottom: 40,
		alignItems: "center",
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#111827", // gray-900
		marginBottom: 8,
		textAlign: "center",
	},
	subtitle: {
		fontSize: 16,
		color: "#6b7280", // gray-500
		textAlign: "center",
	},
	cardsContainer: {
		gap: 20,
	},
	card: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "white",
		borderRadius: 20,
		padding: 24,
		gap: 20,
		borderWidth: 2,
		borderColor: "transparent",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	cardSelected: {
		borderColor: "#10b981", // emerald-500
		backgroundColor: "#f5e0e0", // emerald-50
	},
	cardIcon: {
		fontSize: 32,
	},
	cardTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#1f2937",
		marginBottom: 4,
	},
	cardDescription: {
		fontSize: 14,
		color: "#6b7280",
	},
	textSelected: {
		color: "#065f46", // emerald-800
	},
	footer: {
		marginTop: "auto",
		marginBottom: 20,
	},
	button: {
		backgroundColor: "#10b981", // emerald-500
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: "center",
	},
	buttonDisabled: {
		opacity: 0.5,
	},
	buttonText: {
		color: "white",
		fontSize: 18,
		fontWeight: "600",
	},
});
