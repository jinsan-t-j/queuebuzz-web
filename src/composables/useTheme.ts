import { ref } from 'vue'

const theme = ref<'light' | 'dark'>(
  (localStorage.getItem('qb_theme') as 'light' | 'dark') ||
    (globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
)

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('qb_theme', theme.value)
  }

  // Note: class application is now handled at the layout level
  // to support scoping dark mode to specific modules (e.g. Dashboard only).

  return {
    theme,
    toggleTheme,
    isDark: theme.value === 'dark',
  }
}
