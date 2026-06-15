import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { useRootNavigationState, useRouter, useSegments } from "expo-router";
import { memo, useEffect } from "react";
import { Text, TextInput } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AccessibilityProvider } from "@/context/AccessibilityContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { useUser } from "@/hooks/use-user";
import { useUserRole } from "@/hooks/use-user-role";
import { queryClient } from "@/lib/react-query";
import { TRPCProvider, trpcClient } from "@/lib/trpc";

// Cap how far the OS "larger text" accessibility setting scales our fonts.
// Low-vision users can still enlarge text substantially (up to 2x), but the
// cap stops fixed-height buttons and rows from breaking at extreme sizes.
type ScalableDefaults = { defaultProps?: { maxFontSizeMultiplier?: number } };
const MAX_FONT_SCALE = 2;
for (const Component of [Text, TextInput]) {
	const scalable = Component as unknown as ScalableDefaults;
	scalable.defaultProps = {
		...scalable.defaultProps,
		maxFontSizeMultiplier: MAX_FONT_SCALE,
	};
}

export const unstable_settings = {
	anchor: "(tabs)",
};

export default function RootLayout() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaProvider>
				<AccessibilityProvider>
					<LanguageProvider>
						<TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
							<QueryClientProvider client={queryClient}>
								<ThemeProvider value={DefaultTheme}>
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

// Memoized so a re-render of a parent provider (e.g. changing the app language,
// which lives above the navigator) does not re-run the fragile root navigation
// hooks below. Screens that consume those contexts still update on their own.
const RootLayoutNav = memo(function RootLayoutNav() {
	const { data: user, isLoading: isUserLoading } = useUser();
	const {
		role,
		isLoading: isRoleLoading,
		refetch: refetchRole,
	} = useUserRole();
	const segments = useSegments();
	const router = useRouter();

	const isLoading = isUserLoading || isRoleLoading;

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
});
