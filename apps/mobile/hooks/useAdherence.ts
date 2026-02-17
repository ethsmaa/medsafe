import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc";

export function useAdherence() {
	const trpc = useTRPC();

	const adherenceQuery = useQuery(
		trpc.medication.getAdherenceStats.queryOptions(),
	);

	const adherence = adherenceQuery.data?.percentage || 0;
	const takenCount = adherenceQuery.data?.takenCount || 0;
	const totalCount = adherenceQuery.data?.totalScheduled || 0;

	return {
		adherenceData: {
			percentage: adherence,
			taken: takenCount,
			total: totalCount,
		},
		isLoading: adherenceQuery.isLoading,
		refetchAdherence: adherenceQuery.refetch,
	};
}
