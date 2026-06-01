import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@/hooks/use-user";
import { logger } from "@/lib/logger";
import { useTRPC } from "@/lib/trpc";

const CARD_BASE =
	"flex-row items-center gap-5 rounded-[20px] border-2 bg-surface-light p-6 shadow-sm dark:bg-surface-dark";
const CARD_SELECTED =
	"border-success-light bg-primary-soft-light dark:bg-primary-soft-dark";

export default function RoleSelectionScreen() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [selectedRole, setSelectedRole] = useState<
		"PATIENT" | "CAREGIVER" | null
	>(null);

	const { data: user } = useUser();

	const setupRoleMutation = useMutation({
		...trpc.user.setupRole.mutationOptions(),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: trpc.user.getProfile.queryOptions({ userId: user?.id })
					.queryKey,
			});
		},
		onError: (err) => {
			logger.error("Setup Role Error:", err);
			Alert.alert("Error", err.message);
		},
	});

	const handleConfirm = () => {
		if (!selectedRole) return;
		setupRoleMutation.mutate({ role: selectedRole });
	};

	const isDisabled = !selectedRole || setupRoleMutation.isPending;

	return (
		<SafeAreaView className="flex-1 bg-background-light p-6 dark:bg-background-dark">
			<View className="mt-10 mb-10 items-center">
				<Text className="mb-2 text-center font-bold text-3xl text-text-main-light dark:text-text-main-dark">
					Welcome to MedSafe
				</Text>
				<Text className="text-center text-base text-text-sub-light dark:text-text-sub-dark">
					Please choose your role to continue.
				</Text>
			</View>

			<View className="gap-5">
				<TouchableOpacity
					className={`${CARD_BASE} ${selectedRole === "PATIENT" ? CARD_SELECTED : "border-transparent"}`}
					onPress={() => setSelectedRole("PATIENT")}
					activeOpacity={0.8}
				>
					<Text className="text-[32px]">👤</Text>
					<View>
						<Text
							className={`mb-1 font-bold text-lg ${selectedRole === "PATIENT" ? "text-emerald-800" : "text-text-main-light dark:text-text-main-dark"}`}
						>
							I am a Patient
						</Text>
						<Text
							className={`text-sm ${selectedRole === "PATIENT" ? "text-emerald-800" : "text-text-sub-light dark:text-text-sub-dark"}`}
						>
							Manage my own medications
						</Text>
					</View>
				</TouchableOpacity>

				<TouchableOpacity
					className={`${CARD_BASE} ${selectedRole === "CAREGIVER" ? CARD_SELECTED : "border-transparent"}`}
					onPress={() => setSelectedRole("CAREGIVER")}
					activeOpacity={0.8}
				>
					<Text className="text-[32px]">🩺</Text>
					<View>
						<Text
							className={`mb-1 font-bold text-lg ${selectedRole === "CAREGIVER" ? "text-emerald-800" : "text-text-main-light dark:text-text-main-dark"}`}
						>
							I am a Caregiver
						</Text>
						<Text
							className={`text-sm ${selectedRole === "CAREGIVER" ? "text-emerald-800" : "text-text-sub-light dark:text-text-sub-dark"}`}
						>
							Manage for others
						</Text>
					</View>
				</TouchableOpacity>
			</View>

			<View className="mt-auto mb-5">
				<TouchableOpacity
					className={`items-center rounded-xl bg-success-light py-4 ${isDisabled ? "opacity-50" : ""}`}
					disabled={isDisabled}
					onPress={handleConfirm}
				>
					<Text className="font-semibold text-lg text-white">
						{setupRoleMutation.isPending ? "Setting up..." : "Continue"}
					</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}
