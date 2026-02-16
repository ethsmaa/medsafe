import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useMedicationSchedule } from "@/hooks/useMedicationSchedule";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc";

export function useDashboardData() {
	const trpc = useTRPC();
	const { data: session } = authClient.useSession();
	const [refreshing, setRefreshing] = useState(false);

	// Queries
	const invitesQuery = useQuery(
		trpc.careTeam.getMyReceivedInvites.queryOptions(),
	);
	const cabinetQuery = useQuery(trpc.medication.getMyCabinet.queryOptions({}));
	const adherenceQuery = useQuery(
		trpc.medication.getAdherenceStats.queryOptions(),
	);

	// Derived State
	const { nextDose, schedule, flexibleItems } = useMedicationSchedule(
		cabinetQuery.data || [],
	);
	const adherence = adherenceQuery.data?.percentage || 0;
	const takenCount = adherenceQuery.data?.takenCount || 0;
	const totalCount = adherenceQuery.data?.totalScheduled || 0;

	// Actions
	const refresh = useCallback(async () => {
		setRefreshing(true);
		await Promise.all([
			invitesQuery.refetch(),
			cabinetQuery.refetch(),
			adherenceQuery.refetch(),
		]);
		setRefreshing(false);
	}, [invitesQuery, cabinetQuery, adherenceQuery]);

	const acceptInviteMutation = useMutation({
		...trpc.careTeam.respondToInvite.mutationOptions(),
		onSuccess: () => {
			Alert.alert("Success", "Caregiver added to your team.");
			invitesQuery.refetch();
		},
	});

	const confirmIntakeMutation = useMutation({
		...trpc.medication.confirmIntake.mutationOptions(),
		onSuccess: () => {
			Alert.alert("Taken", "Medication recorded as taken.");
			cabinetQuery.refetch();
			adherenceQuery.refetch();
		},
		onError: (err) => {
			Alert.alert("Error", err.message);
		},
	});

	const handleTakeNow = (prescriptionMedicationId: string) => {
		confirmIntakeMutation.mutate({
			prescriptionMedicationId,
			status: "TAKEN",
		});
	};

	const handleAcceptInvite = (inviteId: string) => {
		acceptInviteMutation.mutate({
			inviteId,
			status: "ACTIVE",
		});
	};

	return {
		session,
		refreshing,
		refresh,
		// Data
		invites: invitesQuery.data || [],
		nextDose,
		schedule,
		flexibleItems,
		adherenceData: {
			percentage: adherence,
			taken: takenCount,
			total: totalCount,
		},
		// Actions
		takeMedication: handleTakeNow,
		acceptInvite: handleAcceptInvite,
		isTaking: confirmIntakeMutation.isPending,
		isAccepting: acceptInviteMutation.isPending,
		// Loading States
		isLoading:
			invitesQuery.isLoading ||
			cabinetQuery.isLoading ||
			adherenceQuery.isLoading,
	};
}
