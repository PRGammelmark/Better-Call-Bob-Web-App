import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import daTranslations from './locales/da.json'
import enTranslations from './locales/en.json'

// Tjek URL parametre for sprog
const getLanguageFromURL = () => {
  const urlParams = new URLSearchParams(window.location.search)
  
  // Tjek for isEnglish=true parameter
  if (urlParams.get('isEnglish') === 'true') {
    return 'en'
  }
  
  // Tjek for lang parameter (fx lang=en eller lang=da)
  const langParam = urlParams.get('lang')
  if (langParam === 'en' || langParam === 'da') {
    return langParam
  }
  
  return null // Returner null hvis ingen URL parameter, så LanguageDetector tager over
}

const urlLanguage = getLanguageFromURL()

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
    lng: urlLanguage || undefined, // Sæt sprog fra URL hvis tilgængelig, ellers lad LanguageDetector bestemme
    fallbackLng: 'da', // Fallback til dansk
    debug: false,
    interpolation: {
      escapeValue: false // React escape allerede
    }
  })

export default i18n

