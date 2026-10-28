import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import backend from 'i18next-http-backend';

const namespaces = [
  'common',
  'navigation',
  'auth',
  'profile',
  'chess',
  'chat',
  'home',
  'rankings',
  'legal',
];

const supportedLanguages = ['en', 'fr', 'es'];
const savedLanguage = window.localStorage.getItem('lng');
const browserLanguage = window.navigator.language.split('-')[0];
const language =
  savedLanguage !== null && supportedLanguages.includes(savedLanguage)
    ? savedLanguage
    : supportedLanguages.includes(browserLanguage)
      ? browserLanguage
      : 'en';

i18n
  .use(backend)
  .use(initReactI18next)
  .init({
    supportedLngs: supportedLanguages,
    fallbackLng: 'en',
    lng: language,
    ns: namespaces,
    defaultNS: 'common',
    saveMissing: true,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
