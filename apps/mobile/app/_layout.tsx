import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { useRootNavigationState, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AccessibilityProvider } from "@/context/AccessibilityContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useUser } from "@/hooks/use-user";
import { useUserRole } from "@/hooks/use-user-role";
import { queryClient } from "@/lib/react-query";
import { TRPCProvider, trpcClient } from "@/lib/trpc";

export const unstable_settings = {
	anchor: "(tabs)",
};

export default function RootLayout() {
	const colorScheme = useColorScheme();

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaProvider>
				<AccessibilityProvider>
					<LanguageProvider>
						<TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
							<QueryClientProvider client={queryClient}>
								<ThemeProvider
									value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
								>
									<RootLayoutNav />
									<StatusBar style="auto" />
								</ThemeProvider>
							</QueryClientProvider>
						</TRPCProvider>
					</LanguageProvider>
				</AccessibilityProvider>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}

function RootLayoutNav() {
	const { data: user, isLoading: isUserLoading } = useUser();
	const {
		role,
		isLoading: isRoleLoading,
		refetch: refetchRole,
	} = useUserRole();
	const segments = useSegments();
	const router = useRouter();

	const isLoading = isUserLoading || isRoleLoading;

	console.log("RootLayoutNav State:", {
		user: !!user,
		role,
		segment: segments[0],
		isLoading,
	});

	// Re-fetch role on focus or mount to ensure fresh state after signup/login
	useEffect(() => {
		if (user && !role) {
			refetchRole();
		}
	}, [user, role, refetchRole]);

	const rootNavigationState = useRootNavigationState();
	const isNavigationReady = rootNavigationState?.key;

	useEffect(() => {
		if (isLoading || !isNavigationReady) return;

		const inAuthGroup = segments[0] === "(auth)";

		if (!user) {
			// User is NOT logged in
			// If NOT in auth group, redirect to login
			if (!inAuthGroup) {
				// Use setTimeout to avoid "navigate before mount" race condition
				setTimeout(() => {
					router.replace("/(auth)/login");
				}, 0);
			}
		} else {
			// User IS logged in
			if (inAuthGroup) {
				// If in auth group, redirect out
				setTimeout(() => {
					if (!role) {
						router.replace("/role-selection");
					} else if (role === "PATIENT") {
						router.replace("/(patient)/(tabs)");
					} else if (role === "CAREGIVER") {
						router.replace("/(caregiver)/(tabs)");
					}
				}, 0);
			} else {
				// already in protected flow, check role logic if needed
				setTimeout(() => {
					if (!role) {
						if (segments[0] !== "role-selection") {
							router.replace("/role-selection");
						}
					} else if (role === "PATIENT") {
						if (segments[0] !== "(patient)") {
							router.replace("/(patient)/(tabs)");
						}
					} else if (role === "CAREGIVER") {
						if (segments[0] !== "(caregiver)") {
							router.replace("/(caregiver)/(tabs)");
						}
					}
				}, 0);
			}
		}
	}, [user, role, segments, isLoading, isNavigationReady, router]);

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="(auth)" />
			<Stack.Screen name="role-selection" />
			<Stack.Screen name="(patient)" />
			<Stack.Screen name="(caregiver)" />
			<Stack.Screen
				name="modal"
				options={{ presentation: "modal", title: "Modal" }}
			/>
		</Stack>
	);
}
