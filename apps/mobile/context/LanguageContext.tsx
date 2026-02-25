import AsyncStorage from "@react-native-async-storage/async-storage";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { type Locale, type TranslationKey, translations } from "@/i18n";

type LanguageContextType = {
	locale: Locale;
	setLocale: (locale: Locale) => void;
	t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
	undefined,
);

const STORAGE_KEY = "app_locale";

export function LanguageProvider({ children }: { children: ReactNode }) {
	const [locale, setLocaleState] = useState<Locale>("tr");

	useEffect(() => {
		const load = async () => {
			try {
				const saved = await AsyncStorage.getItem(STORAGE_KEY);
				if (saved === "en" || saved === "tr") {
					setLocaleState(saved);
				}
			} catch {
				// Use default
			}
		};
		load();
	}, []);

	const setLocale = useCallback(async (newLocale: Locale) => {
		setLocaleState(newLocale);
		await AsyncStorage.setItem(STORAGE_KEY, newLocale);
	}, []);

	const t = useCallback(
		(key: TranslationKey): string => {
			return translations[locale][key] ?? key;
		},
		[locale],
	);

	return (
		<LanguageContext.Provider value={{ locale, setLocale, t }}>
			{children}
		</LanguageContext.Provider>
	);
}

export function useLanguage() {
	const context = useContext(LanguageContext);
	if (!context) {
		throw new Error("useLanguage must be used within a LanguageProvider");
	}
	return context;
}
