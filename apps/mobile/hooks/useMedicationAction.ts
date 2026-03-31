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

	const deleteMutation = useMutation({
		...trpc.medication.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries(trpc.medication.getMyCabinet.pathFilter());
			queryClient.invalidateQueries(
				trpc.medication.getAdherenceStats.pathFilter(),
			);
			Alert.alert("Success", "Medication deleted.");
			onSuccess?.();
		},
		onError: (err) => {
			Alert.alert("Error", "Failed to delete medication: " + err.message);
		},
	});

	const deleteManyMutation = useMutation({
		...trpc.medication.deleteMany.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries(trpc.medication.getMyCabinet.pathFilter());
			queryClient.invalidateQueries(
				trpc.medication.getAdherenceStats.pathFilter(),
			);
			Alert.alert("Success", "Selected medications deleted.");
			onSuccess?.();
		},
		onError: (err) => {
			Alert.alert("Error", "Failed to delete medications: " + err.message);
		},
	});

	const takeMedication = (prescriptionMedicationId: string, takenAt?: string) => {
		confirmIntakeMutation.mutate({
			prescriptionMedicationId,
			status: "TAKEN",
			takenAt,
		});
	};

	const deleteMedication = (prescriptionMedicationId: string) => {
		Alert.alert(
			"Delete Medication",
			"Are you sure you want to delete this medication? This action cannot be undone.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: () => {
						deleteMutation.mutate({
							id: prescriptionMedicationId,
						});
					},
				},
			],
		);
	};

	const deleteManyMedications = (ids: string[]) => {
		Alert.alert(
			"Delete Multiple",
			`Are you sure you want to delete ${ids.length} medications? This action cannot be undone.`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete All",
					style: "destructive",
					onPress: () => {
						deleteManyMutation.mutate({ ids });
					},
				},
			],
		);
	};

	return {
		takeMedication,
		deleteMedication,
		deleteManyMedications,
		isTaking: confirmIntakeMutation.isPending,
		isDeleting: deleteMutation.isPending || deleteManyMutation.isPending,
	};
}
