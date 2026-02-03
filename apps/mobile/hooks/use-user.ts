import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export const useUser = () => {
	return useQuery({
		queryKey: ["user"],
		staleTime: 5 * 60 * 1000, // 5 minutes
		queryFn: async () => {
			const { data: sessionData } = await authClient.getSession();
			const sessionUser = sessionData?.user;
			if (!sessionUser) return null;
			return sessionUser;
		},
	});
};
