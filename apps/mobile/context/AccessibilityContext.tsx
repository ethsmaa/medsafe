import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { logger } from "@/lib/logger";

type ThemeMode = "light" | "dark" | "system";

type AccessibilityContextType = {
	isHighContrast: boolean;
	isDarkMode: boolean;
	themeMode: ThemeMode;
	textSize: number;
	toggleHighContrast: () => void;
	setThemeMode: (mode: ThemeMode) => void;
	setTextSize: (size: number) => void;
};

const AccessibilityContext = createContext<
	AccessibilityContextType | undefined
>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
	const [isHighContrast, setIsHighContrast] = useState(false);
	const [textSize, setTextSizeState] = useState(1);
	const [themeMode, setThemeModeState] = useState<ThemeMode>("light");

	const { colorScheme: systemScheme, setColorScheme } =
		useNativeWindColorScheme();

	// Derived: actual dark mode state
	const isDarkMode =
		themeMode === "dark" || (themeMode === "system" && systemScheme === "dark");

	// Sync NativeWind color scheme with our setting
	useEffect(() => {
		if (themeMode === "system") {
			setColorScheme("system");
		} else {
			setColorScheme(themeMode);
		}
	}, [themeMode, setColorScheme]);

	useEffect(() => {
		const loadSettings = async () => {
			try {
				const savedContrast = await AsyncStorage.getItem("isHighContrast");
				const savedSize = await AsyncStorage.getItem("textSize");
				const savedTheme = await AsyncStorage.getItem("themeMode");

				if (savedContrast !== null) {
					setIsHighContrast(JSON.parse(savedContrast));
				}
				if (savedSize !== null) {
					setTextSizeState(Number.parseFloat(savedSize));
				}
				if (
					savedTheme === "light" ||
					savedTheme === "dark" ||
					savedTheme === "system"
				) {
					setThemeModeState(savedTheme);
				}
			} catch (e) {
				logger.error("Failed to load accessibility settings", e);
			}
		};

		loadSettings();
	}, []);

	const toggleHighContrast = async () => {
		const newValue = !isHighContrast;
		setIsHighContrast(newValue);
		await AsyncStorage.setItem("isHighContrast", JSON.stringify(newValue));
	};

	const setTextSize = async (size: number) => {
		setTextSizeState(size);
		await AsyncStorage.setItem("textSize", size.toString());
	};

	const setThemeMode = async (mode: ThemeMode) => {
		setThemeModeState(mode);
		await AsyncStorage.setItem("themeMode", mode);
	};

	return (
		<AccessibilityContext.Provider
			value={{
				isHighContrast,
				isDarkMode,
				themeMode,
				textSize,
				toggleHighContrast,
				setThemeMode,
				setTextSize,
			}}
		>
			{children}
		</AccessibilityContext.Provider>
	);
}

export function useAccessibility() {
	const context = useContext(AccessibilityContext);
	if (context === undefined) {
		throw new Error(
			"useAccessibility must be used within an AccessibilityProvider",
		);
	}
	return context;
}
