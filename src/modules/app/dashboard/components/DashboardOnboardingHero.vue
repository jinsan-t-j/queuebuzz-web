<script setup lang="ts">
/**
 * @component DashboardOnboardingHero
 * @description A high-impact onboarding section for new hosts, featuring a welcome hero,
 * quick actions, and setup progress tracking.
 */

import { useRouter } from 'vue-router'
import { ArrowRight, RefreshCw, AlertCircle } from 'lucide-vue-next'
import type { QuickSetup } from '../types'
import BaseButton from '@/components/base/BaseButton.vue'
import DashboardQuickSetup from './DashboardQuickSetup.vue'

defineProps<{
  userName?: string
  quickSetup: QuickSetup
  showQuickSetup: boolean
}>()

const emit = defineEmits<{
  (e: 'start-now'): void
  (e: 'create-first-queue'): void
  (e: 'step-click', index: number): void
}>()

const router = useRouter()
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- Welcome Hero -->
    <div
      class="rounded-3xl border border-mint/20 bg-mint-light px-6 py-8 sm:px-8 sm:py-10 overflow-hidden relative"
    >
      <!-- Decorative Background Element -->
      <div
        class="absolute -right-12 -top-12 w-48 h-48 sm:w-64 sm:h-64 bg-mint/10 rounded-full blur-3xl pointer-events-none"
      />

      <div class="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-col gap-2">
          <h1 class="font-display text-2xl sm:text-3xl font-black text-plum tracking-tight">
            Welcome to QueueBuzz, {{ userName || 'Partner' }}!
          </h1>
          <p class="max-w-xl font-body text-sm sm:text-base text-plum-muted leading-relaxed">
            You're just one step away from transforming your customer experience. Start your first
            session now or follow our guide to get fully set up.
          </p>
        </div>
        <BaseButton class="group w-full sm:w-auto" size="lg" @click="emit('start-now')">
          Start Your First Session
          <ArrowRight class="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </BaseButton>
      </div>
    </div>

    <!-- Quick Actions for New Users -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        class="group p-6 rounded-3xl bg-white border border-plum-faint hover:border-mint transition-all cursor-pointer shadow-none"
        @click="emit('create-first-queue')"
      >
        <div
          class="w-12 h-12 rounded-2xl bg-sand flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
        >
          <RefreshCw class="w-6 h-6 text-mint-dark" />
        </div>
        <h3 class="font-display font-black text-lg text-plum mb-1">Create Queue</h3>
        <p class="font-body text-sm text-plum-muted">
          Define your service capacity and join codes.
        </p>
      </div>

      <div
        class="group p-6 rounded-3xl bg-white border border-plum-faint hover:border-mint transition-all cursor-pointer shadow-none"
        @click="router.push('/settings')"
      >
        <div
          class="w-12 h-12 rounded-2xl bg-sand flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
        >
          <AlertCircle class="w-6 h-6 text-plum" />
        </div>
        <h3 class="font-display font-black text-lg text-plum mb-1">Business Info</h3>
        <p class="font-body text-sm text-plum-muted">
          Add your logo and location for customers to see.
        </p>
      </div>

      <div
        class="group p-6 rounded-3xl bg-white border border-plum-faint hover:border-mint transition-all cursor-pointer shadow-none"
        @click="router.push('/billing')"
      >
        <div
          class="w-12 h-12 rounded-2xl bg-sand flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
        >
          <svg
            class="w-6 h-6 text-plum"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h3 class="font-display font-black text-lg text-plum mb-1">Pick a Plan</h3>
        <p class="font-body text-sm text-plum-muted">
          Unlock advanced analytics and priority support.
        </p>
      </div>
    </div>

    <!-- Progress/Checklist Section -->
    <div v-if="showQuickSetup" class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h2 class="font-display text-xl font-bold text-plum">Setup Progress</h2>
        <span class="font-body text-xs font-semibold text-plum-muted uppercase tracking-wider">
          {{ quickSetup.steps?.filter((s) => s.isDone).length || 0 }} /
          {{ quickSetup.steps?.length || 0 }} Completed
        </span>
      </div>
      <DashboardQuickSetup :steps="quickSetup.steps" @step-click="emit('step-click', $event)" />
    </div>
  </div>
</template>
