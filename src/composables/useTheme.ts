import { ref, watchEffect } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'

/**
 * Global reactive state for theme mode and the resolved actual theme.
 */
const themeMode = ref<ThemeMode>((localStorage.getItem('qb_theme_mode') as ThemeMode) || 'system')

const theme = ref<'light' | 'dark'>('light')

/**
 * Resolves the actual theme based on themeMode and system preferences.
 */
function resolveTheme() {
  if (themeMode.value === 'system') {
    theme.value = globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } else {
    theme.value = themeMode.value
  }
}

// Initialize
resolveTheme()

// Listen for system preference changes
const darkMediaQuery = globalThis.matchMedia('(prefers-color-scheme: dark)')
darkMediaQuery.addEventListener('change', resolveTheme)

// Watch for mode changes and persist
watchEffect(() => {
  resolveTheme()
  localStorage.setItem('qb_theme_mode', themeMode.value)
})

export function useTheme() {
  return {
    themeMode,
    theme,
    setTheme: (mode: ThemeMode) => {
      themeMode.value = mode
    },
    isDark: theme.value === 'dark',
  }
}
