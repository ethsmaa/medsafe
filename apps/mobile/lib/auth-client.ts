import { expoClient } from "@better-auth/expo/client";
import Constants from "expo-constants";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

/**
 * Dynamically resolves the backend hostname in development.
 * Uses Expo's debuggerHost (auto-detected from Metro bundler connection).
 * No more manually updating IPs!
 */
const getBaseURL = () => {
	if (__DEV__) {
		const debuggerHost = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost;
		const hostname = debuggerHost?.split(":")[0] ?? "localhost";
		return `http://${hostname}:3001/api/auth`;
	}
	return "https://api.medsafe.app/api/auth";
};

console.log(getBaseURL());

export const authClient = createAuthClient({
	baseURL: getBaseURL(),
	plugins: [
		expoClient({
			scheme: "medsafe",
			storagePrefix: "medsafe",
			storage: SecureStore,
		}),
	],
});
