<script setup lang="ts">
/**
 * @component DashboardErrorState
 * @description Presentational component for displaying error states in the dashboard.
 */
import { AlertCircle } from 'lucide-vue-next'
import BaseButton from '@/components/base/BaseButton.vue'

defineProps<{
  error: string | null
}>()

defineEmits<{
  (e: 'retry'): void
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 gap-3">
    <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger/10">
      <AlertCircle class="h-6 w-6 text-danger" />
    </div>
    <p class="font-display text-lg font-bold text-plum">Something went wrong</p>
    <p class="font-body text-sm text-plum-muted">{{ error }}</p>
    <BaseButton variant="ghost" size="sm" @click="$emit('retry')"> Try again </BaseButton>
  </div>
</template>
