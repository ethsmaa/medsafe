import AsyncStorage from "@react-native-async-storage/async-storage";
import {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";

type AccessibilityContextType = {
	isHighContrast: boolean;
	textSize: number; // 1 = normal, 1.2 = large, 1.5 = extra large
	toggleHighContrast: () => void;
	setTextSize: (size: number) => void;
};

const AccessibilityContext = createContext<
	AccessibilityContextType | undefined
>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
	const [isHighContrast, setIsHighContrast] = useState(false);
	const [textSize, setTextSizeState] = useState(1);

	useEffect(() => {
		// Load saved settings
		const loadSettings = async () => {
			try {
				const savedContrast = await AsyncStorage.getItem("isHighContrast");
				const savedSize = await AsyncStorage.getItem("textSize");

				if (savedContrast !== null) {
					setIsHighContrast(JSON.parse(savedContrast));
				}
				if (savedSize !== null) {
					setTextSizeState(Number.parseFloat(savedSize));
				}
			} catch (e) {
				console.error("Failed to load accessibility settings", e);
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

	return (
		<AccessibilityContext.Provider
			value={{
				isHighContrast,
				textSize,
				toggleHighContrast,
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
