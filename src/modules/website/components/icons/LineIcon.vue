<script setup lang="ts">
/**
 * @component LineIcon
 * @description Thin-stroke custom icon set for the marketing site, styled after
 * the hand-drawn single-weight line icons used across editorial SaaS marketing
 * pages (e.g. Cohere Replay) — replaces boxed, filled Lucide icons in feature grids.
 */
defineProps<{
  name:
    | 'bolt'
    | 'shield'
    | 'stack'
    | 'export'
    | 'sync'
    | 'pin'
    | 'screen'
    | 'clipboard'
    | 'qr'
    | 'bell'
    | 'clock'
    | 'palette'
}>()
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path v-if="name === 'bolt'" d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />

    <template v-else-if="name === 'shield'">
      <path d="M12 3 5 6v5c0 4.6 3 8.4 7 10 4-1.6 7-5.4 7-10V6l-7-3z" />
      <path d="m9.5 12 2 2 3.5-4" />
    </template>

    <template v-else-if="name === 'stack'">
      <rect x="4" y="5" width="16" height="4" rx="1" />
      <rect x="4" y="11" width="16" height="4" rx="1" />
      <rect x="4" y="17" width="10" height="3" rx="1" />
    </template>

    <template v-else-if="name === 'export'">
      <path d="M12 3v11" />
      <path d="m8 10 4 4 4-4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </template>

    <template v-else-if="name === 'sync'">
      <path d="M4 12a8 8 0 0 1 14-5.3L20 8" />
      <path d="M20 4v4h-4" />
      <path d="M20 12a8 8 0 0 1-14 5.3L4 16" />
      <path d="M4 20v-4h4" />
    </template>

    <template v-else-if="name === 'pin'">
      <path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </template>

    <template v-else-if="name === 'screen'">
      <rect x="3" y="5" width="18" height="12" rx="2" />
      <path d="M9 21h6" />
      <path d="M12 17v4" />
    </template>

    <template v-else-if="name === 'clipboard'">
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M9 11h6" />
      <path d="M9 15h4" />
    </template>

    <template v-else-if="name === 'qr'">
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <path d="M14 14h3v3" />
      <path d="M20 20h-3v-3" />
    </template>

    <template v-else-if="name === 'bell'">
      <path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </template>

    <template v-else-if="name === 'clock'">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </template>

    <template v-else-if="name === 'palette'">
      <path
        d="M12 3a9 8.5 0 1 0 0 17c1.1 0 1.7-.9 1.2-1.8-.3-.6-.1-1.3.5-1.6.4-.2.9-.3 1.4-.3 2.2 0 3.9-1.7 3.9-4.3C19 6.8 15.9 3 12 3z"
      />
      <circle cx="7.5" cy="11" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="8" r="1.1" fill="currentColor" stroke="none" />
    </template>
  </svg>
</template>
