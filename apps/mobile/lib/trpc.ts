import type { AppRouter } from "@medsafe/backend";
import {
	createTRPCClient,
	httpBatchLink,
	httpSubscriptionLink,
	splitLink,
} from "@trpc/client";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { createTRPCContext } from "@trpc/tanstack-react-query";

import Constants from "expo-constants";
import EventSource from "react-native-sse";
import superjson from "superjson";
import { authClient } from "./auth-client";

export const { TRPCProvider, useTRPC, useTRPCClient } =
	createTRPCContext<AppRouter>();

const getBaseURL = () => {
	if (__DEV__) {
		const debuggerHost =
			Constants.expoConfig?.hostUri ??
			Constants.manifest2?.extra?.expoGo?.debuggerHost;
		const hostname = debuggerHost?.split(":")[0] ?? "localhost";
		return `http://${hostname}:3001/trpc`;
	}
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
