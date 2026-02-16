import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface Invite {
	id: string;
	caregiver: {
		user: {
			name: string | null;
		};
	};
}

interface DashboardInviteProps {
	invite: Invite;
	onAccept: (id: string) => void;
	isAccepting: boolean;
}

export function DashboardInvite({
	invite,
	onAccept,
	isAccepting,
}: DashboardInviteProps) {
	if (!invite) return null;

	return (
		<View className="mb-6 overflow-hidden rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10">
			<View className="mb-3 flex-row items-center gap-3">
				<View className="h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40">
					<Ionicons name="people" size={20} color="#4f46e5" />
				</View>
				<View className="flex-1">
					<Text className="font-bold text-base text-indigo-900 dark:text-indigo-100">
						Care Team Invite
					</Text>
					<Text className="text-indigo-600 text-sm dark:text-indigo-300">
						<Text className="font-bold">
							{invite.caregiver?.user?.name || "A caregiver"}
						</Text>{" "}
						wants to connect.
					</Text>
				</View>
			</View>
			<View className="flex-row justify-end">
				<TouchableOpacity
					onPress={() => onAccept(invite.id)}
					disabled={isAccepting}
					className="rounded-full bg-indigo-600 px-5 py-2 active:opacity-90 dark:bg-indigo-500"
				>
					{isAccepting ? (
						<ActivityIndicator size="small" color="white" />
					) : (
						<Text className="font-bold text-sm text-white">Accept Invite</Text>
					)}
				</TouchableOpacity>
			</View>
		</View>
	);
}
