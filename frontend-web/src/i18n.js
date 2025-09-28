import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi) // Încarcă traducerile dintr-un backend (ex: /public/locales)
  .use(LanguageDetector) // Detectează limba utilizatorului
  .use(initReactI18next) // Pasează instanța i18n către react-i18next
  .init({
    supportedLngs: ['ro', 'en'],
    fallbackLng: 'ro',
    debug: process.env.NODE_ENV === 'development',
    detection: {
      order: ['cookie', 'localStorage', 'navigator'],
      caches: ['cookie'],
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;