import { Text } from "react-native";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/i18n";

/**
 * Translated tab-bar label rendered as a leaf component.
 *
 * The tab layouts must NOT consume the language context directly: doing so
 * re-renders the whole `<Tabs>` navigator on every language change, which
 * crashes with "Couldn't find a navigation context". By translating here, only
 * this label re-renders when the locale changes; the navigator stays stable.
 */
export function TabBarLabel({
	labelKey,
	color,
}: {
	labelKey: TranslationKey;
	color: string;
}) {
	const { t } = useLanguage();
	return (
		<Text
			numberOfLines={1}
			style={{ color, fontSize: 12, fontWeight: "500", marginBottom: 4 }}
		>
			{t(labelKey)}
		</Text>
	);
}
