import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import './style.css'
import './Themes/LightTheme.css'
import './Themes/DarkTheme.css'

const app = createApp(App)

app.config.globalProperties.$auth = {
    user: null
}

app.use(router)
app.use(i18n)
app.mount('#app')

// Crear el panel de configuración simplificado
const createSettingsPanel = () => {
    const savedLocale = localStorage.getItem('app_locale') || 'en'
    const savedTheme = localStorage.getItem('app_theme') || 'light'

    const availableLocales = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'es', name: 'Español', flag: '🇪🇸' }
    ]

    const themes = [
        { code: 'light', name: 'Claro', icon: 'fas fa-sun' },
        { code: 'dark', name: 'Oscuro', icon: 'fas fa-moon' }
    ]

    // Aplicar tema guardado
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme')
        document.body.classList.remove('light-theme')
    } else {
        document.body.classList.add('light-theme')
        document.body.classList.remove('dark-theme')
    }

    // Crear panel principal
    const settingsPanel = document.createElement('div')
    settingsPanel.className = 'settings-panel'

    // Sección de idioma
    const langSection = document.createElement('div')
    langSection.className = 'settings-section'

    const langLabel = document.createElement('div')
    langLabel.className = 'settings-section-label'
    langLabel.innerHTML = '<i class="fas fa-globe"></i> IDIOMA'
    langSection.appendChild(langLabel)

    const langSelector = document.createElement('div')
    langSelector.className = 'settings-options'

    availableLocales.forEach(locale => {
        const button = document.createElement('button')
        button.className = `settings-option-btn ${savedLocale === locale.code ? 'active' : ''}`
        button.innerHTML = `${locale.flag} ${locale.name}`
        button.setAttribute('data-locale', locale.code)
        button.addEventListener('click', () => {
            document.querySelectorAll('.settings-option-btn[data-locale]').forEach(btn => {
                btn.classList.remove('active')
            })
            button.classList.add('active')

            i18n.global.locale.value = locale.code
            localStorage.setItem('app_locale', locale.code)
            document.documentElement.lang = locale.code
        })
        langSelector.appendChild(button)
    })
    langSection.appendChild(langSelector)
    settingsPanel.appendChild(langSection)

    // Sección de tema
    const themeSection = document.createElement('div')
    themeSection.className = 'settings-section'

    const themeLabel = document.createElement('div')
    themeLabel.className = 'settings-section-label'
    themeLabel.innerHTML = '<i class="fas fa-palette"></i> TEMA'
    themeSection.appendChild(themeLabel)

    const themeSelector = document.createElement('div')
    themeSelector.className = 'settings-options'

    themes.forEach(theme => {
        const button = document.createElement('button')
        button.className = `settings-option-btn ${savedTheme === theme.code ? 'active' : ''}`
        button.innerHTML = `<i class="${theme.icon}" style="margin-right: 8px;"></i> ${theme.name}`
        button.setAttribute('data-theme', theme.code)
        button.addEventListener('click', () => {
            document.querySelectorAll('.settings-option-btn[data-theme]').forEach(btn => {
                btn.classList.remove('active')
            })
            button.classList.add('active')

            localStorage.setItem('app_theme', theme.code)

            if (theme.code === 'dark') {
                document.body.classList.add('dark-theme')
                document.body.classList.remove('light-theme')
            } else {
                document.body.classList.add('light-theme')
                document.body.classList.remove('dark-theme')
            }
        })
        themeSelector.appendChild(button)
    })
    themeSection.appendChild(themeSelector)
    settingsPanel.appendChild(themeSection)

    document.body.appendChild(settingsPanel)
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createSettingsPanel)
} else {
    createSettingsPanel()
}