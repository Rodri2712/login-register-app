import en from './en.json'
import es from './es.json'

export const messages = {
    en,
    es
}

export const availableLocales = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
]

export const defaultLocale = 'en'

export function getBrowserLocale() {
    const browserLang = navigator.language.split('-')[0]
    if (availableLocales.some(locale => locale.code === browserLang)) {
        return browserLang
    }
    return defaultLocale
}