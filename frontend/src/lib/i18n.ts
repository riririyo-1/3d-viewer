import en from "@/locales/en.json";
import ja from "@/locales/ja.json";

export const locales = {
  en,
  ja,
};

export type Locale = keyof typeof locales;
export type TranslationKeys = typeof en;

// Flatten the keys for easier access if nested (optional, keeping it simple for now)
// access: t('common.manageAssets')

export const defaultLocale: Locale = "en";
