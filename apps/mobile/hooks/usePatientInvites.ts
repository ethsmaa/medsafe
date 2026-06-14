import { useMutation, useQuery } from "@tanstack/react-query";
import { Alert } from "react-native";
import { queryClient } from "@/lib/react-query";
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
			// Refresh the invite list AND the caregiver list (shown on other
			// screens) so accepting an invite is reflected everywhere.
			queryClient.invalidateQueries(
				trpc.careTeam.getMyReceivedInvites.pathFilter(),
			);
			queryClient.invalidateQueries(trpc.careTeam.getMyCaregivers.pathFilter());
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
