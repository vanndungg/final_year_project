import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import viTranslations from './locales/vi.json';

// Get language from localStorage or default to English
const savedLanguage = localStorage.getItem('language') || 'en';

const resources = {
    en: {
        translation: enTranslations
    },
    vi: {
        translation: viTranslations
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: savedLanguage,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false // React already prevents XSS
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage']
        }
    })
    .catch((err) => {
        console.error('i18n initialization error:', err);
    });

export default i18n;
