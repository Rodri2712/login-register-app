import { createI18n } from 'vue-i18n'
import { messages, defaultLocale, getBrowserLocale } from './locales'

// Obtener idioma guardado o del navegador
const savedLocale = localStorage.getItem('app_locale')
const initialLocale = savedLocale || getBrowserLocale()

const i18n = createI18n({
    legacy: false,
    locale: initialLocale,
    fallbackLocale: defaultLocale,
    messages,
    globalInjection: true,
    missingWarn: false,
    fallbackWarn: false
})

// Guardar idioma cuando cambie
export function setLocale(locale) {
    i18n.global.locale.value = locale
    localStorage.setItem('app_locale', locale)
    document.documentElement.lang = locale
}

export function getCurrentLocale() {
    return i18n.global.locale.value
}

export default i18n