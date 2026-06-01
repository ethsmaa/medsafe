import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Treat data as fresh briefly to avoid refetch storms on quick remounts.
			staleTime: 15_000,
			gcTime: 5 * 60_000,
			retry: 1,
			// React Native has no real window focus; manual refetch + RefreshControl cover it.
			refetchOnWindowFocus: false,
		},
		mutations: {
			// Don't auto-retry mutations — avoids accidental double writes.
			retry: 0,
		},
	},
});
