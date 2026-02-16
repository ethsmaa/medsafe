import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { createAuthClient } from "better-auth/react";

const getBaseURL = () => {
	if (__DEV__) {
		const hostname =  "192.168.1.121"; 
		
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
			storage: SecureStore
		}),
	],
});
