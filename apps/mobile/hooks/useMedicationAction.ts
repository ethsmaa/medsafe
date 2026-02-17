import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { useTRPC } from "@/lib/trpc";

export function useMedicationAction({
	onSuccess,
}: {
	onSuccess?: () => void;
} = {}) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const confirmIntakeMutation = useMutation({
		...trpc.medication.confirmIntake.mutationOptions(),
		onSuccess: () => {
			// Invalidate relevant queries to refresh data
			queryClient.invalidateQueries({
				queryKey: trpc.medication.getMyCabinet.queryKey(),
			});
			queryClient.invalidateQueries({
				queryKey: trpc.medication.getAdherenceStats.queryKey(),
			});

			Alert.alert("Taken", "Medication recorded as taken.");
			onSuccess?.();
		},
		onError: (err) => {
			Alert.alert("Error", err.message);
		},
	});

	const takeMedication = (prescriptionMedicationId: string) => {
		confirmIntakeMutation.mutate({
			prescriptionMedicationId,
			status: "TAKEN",
		});
	};

	return {
		takeMedication,
		isTaking: confirmIntakeMutation.isPending,
	};
}
