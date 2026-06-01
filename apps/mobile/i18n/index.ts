import en from "./en";
import type { TranslationKey } from "./tr";
import tr from "./tr";

export type Locale = "tr" | "en";

export const translations: Record<Locale, Record<TranslationKey, string>> = {
	tr,
	en,
};

export type { TranslationKey };
