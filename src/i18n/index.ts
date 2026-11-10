import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import sw from './locales/sw.json';

export const defaultNS = 'common';
export const resources = {
  en,
  sw,
} as const;

const deviceLocales = Localization.getLocales();
const primaryLanguage = deviceLocales[0]?.languageCode ?? 'en';
const supportedLanguage = ['en', 'sw'].includes(primaryLanguage) ? primaryLanguage : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: supportedLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
