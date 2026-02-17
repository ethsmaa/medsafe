import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
// Modular hooks
import { useAdherence } from "@/hooks/useAdherence";
import { useMedicationAction } from "@/hooks/useMedicationAction";
import {
	type CabinetItem,
	useMedicationSchedule,
} from "@/hooks/useMedicationSchedule";
import { usePatientInvites } from "@/hooks/usePatientInvites";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc";

export function useDashboardData() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();
	const [refreshing, setRefreshing] = useState(false);

	// 1. Invites Logic
	const {
		invites,
		isLoading: invitesLoading,
		acceptInvite,
		isAccepting,
		refetchInvites,
	} = usePatientInvites();

	// 2. Adherence Logic
	const {
		adherenceData,
		isLoading: adherenceLoading,
		refetchAdherence,
	} = useAdherence();

	// 3. Cabinet Data (Kept here as it's the core of the dashboard)
	const cabinetQuery = useQuery(trpc.medication.getMyCabinet.queryOptions({}));

	// 4. Medication Actions
	const { takeMedication, isTaking } = useMedicationAction({
		onSuccess: () => {
			// Optional: specific actions on success if needed
			// Note: useMedicationAction handles invalidation
		},
	});

	// Derived State for Schedule
	const { nextDose, schedule, flexibleItems } = useMedicationSchedule(
		(cabinetQuery.data as CabinetItem[]) || [],
	);

	// Global Refresh Handler
	const refresh = useCallback(async () => {
		setRefreshing(true);
		await Promise.all([
			refetchInvites(),
			cabinetQuery.refetch(),
			refetchAdherence(),
			// Invalidate queries to be safe
			queryClient.invalidateQueries({
				queryKey: trpc.medication.getMyCabinet.queryKey(),
			}),
		]);
		setRefreshing(false);
	}, [refetchInvites, cabinetQuery, refetchAdherence, queryClient, trpc]);

	return {
		session,
		refreshing,
		refresh,
		// Data
		invites,
		nextDose,
		schedule,
		flexibleItems,
		adherenceData,
		// Actions
		takeMedication,
		acceptInvite,
		isTaking,
		isAccepting,
		// Loading States
		isLoading: invitesLoading || cabinetQuery.isLoading || adherenceLoading,
	};
}
