import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import daTranslations from './locales/da.json'
import enTranslations from './locales/en.json'

i18n
  .use(LanguageDetector) // Detekterer browser sprog
  .use(initReactI18next)
  .init({
    resources: {
      da: {
        translation: daTranslations
      },
      en: {
        translation: enTranslations
      }
    },
    fallbackLng: 'da', // Fallback til dansk
    debug: false,
    interpolation: {
      escapeValue: false // React escape allerede
    }
  })

export default i18n

