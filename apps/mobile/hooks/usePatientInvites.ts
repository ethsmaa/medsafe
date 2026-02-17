import { useMutation, useQuery } from "@tanstack/react-query";
import { Alert } from "react-native";
import { useTRPC } from "@/lib/trpc";

export function usePatientInvites() {
	const trpc = useTRPC();

	const invitesQuery = useQuery(
		trpc.careTeam.getMyReceivedInvites.queryOptions(),
	);

	const acceptInviteMutation = useMutation({
		...trpc.careTeam.respondToInvite.mutationOptions(),
		onSuccess: () => {
			Alert.alert("Success", "Caregiver added to your team.");
			invitesQuery.refetch();
		},
		onError: (err) => {
			Alert.alert("Error", err.message);
		},
	});

	const handleAcceptInvite = (inviteId: string) => {
		acceptInviteMutation.mutate({
			inviteId,
			status: "ACTIVE",
		});
	};

	return {
		invites: invitesQuery.data || [],
		isLoading: invitesQuery.isLoading,
		isAccepting: acceptInviteMutation.isPending,
		acceptInvite: handleAcceptInvite,
		refetchInvites: invitesQuery.refetch,
	};
}
