import type { AppRouter } from "@medsafe/backend";
import {
	createTRPCClient,
	httpBatchLink,
	httpSubscriptionLink,
	splitLink,
} from "@trpc/client";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { createTRPCContext } from "@trpc/tanstack-react-query";

import EventSource from "react-native-sse";
import superjson from "superjson";
import { authClient } from "./auth-client";

export const { TRPCProvider, useTRPC, useTRPCClient } =
	createTRPCContext<AppRouter>();

const getBaseURL = () => {
	if (__DEV__) {
		const hostname = "192.168.1.121";
		return `http://${hostname}:3001/trpc`;
	}
	// TODO: Update for production
	return "https://api.medsafe.app/trpc";
};

const getAuthHeaders = (): Record<string, string> => {
	const headers: Record<string, string> = {};
	const cookies = authClient.getCookie();
	if (cookies) {
		headers["Cookie"] = cookies;
	}
	return headers;
};

export const trpcClient = createTRPCClient<AppRouter>({
	links: [
		splitLink({
			condition: (op) => op.type === "subscription",
			true: httpSubscriptionLink({
				url: getBaseURL(),
				transformer: superjson,
				EventSource: EventSource as unknown as typeof globalThis.EventSource,
				eventSourceOptions: () =>
					({
						headers: getAuthHeaders(),
					}) as EventSourceInit,
			}),
			false: httpBatchLink({
				url: getBaseURL(),
				transformer: superjson,
				headers: getAuthHeaders,
			}),
		}),
	],
});

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
