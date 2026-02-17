import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { useTRPC } from "@/lib/trpc";

export function useUserRole() {
	const trpc = useTRPC();
	const { data: user } = useUser();

	const { data, isLoading, error, refetch } = useQuery({
		...trpc.user.getProfile.queryOptions({ userId: user?.id }),
		enabled: !!user, // Only fetch if user is logged in
	});

	return {
		role: data?.role ?? null,
		profileId: data?.profileId ?? null,
		isLoading,
		isError: !!error,
		refetch,
	};
}
