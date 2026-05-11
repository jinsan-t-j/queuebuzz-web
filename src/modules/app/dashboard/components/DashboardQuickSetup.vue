<script setup lang="ts">
/**
 * @component DashboardQuickSetup
 * @description Onboarding checklist with 3 setup steps.
 * Hidden once all steps are done.
 *
 * @prop {Array} steps - Array of { label, sub, isDone }.
 * @emits {step-click} - Emitted with step index when a step row is clicked.
 */

import { Check, ChevronRight, Lock } from 'lucide-vue-next'

import type { SetupStep } from '../types'

withDefaults(
  defineProps<{
    steps?: SetupStep[]
  }>(),
  {
    steps: () => [],
  },
)

const emit = defineEmits(['step-click'])
</script>

<template>
  <div class="rounded-xl border border-plum-faint bg-white p-6 shadow-none">
    <h3 class="font-body text-lg font-black text-plum">Quick Setup</h3>

    <div class="mt-6 flex flex-col gap-3">
      <button
        v-for="(step, idx) in steps"
        :key="idx"
        :class="[
          'flex items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-all sm:gap-4 sm:px-4 sm:py-3.5',
          step.isDone
            ? 'bg-mint/5 opacity-80'
            : idx === 0 || steps[idx - 1]?.isDone
              ? 'bg-sand hover:bg-mint/10'
              : 'border border-plum-faint opacity-50 grayscale',
        ]"
        @click="emit('step-click', idx)"
      >
        <!-- Circle indicator -->
        <div
          :class="[
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
            step.isDone
              ? 'bg-mint'
              : idx === 0 || steps[idx - 1]?.isDone
                ? 'bg-plum'
                : 'border-2 border-plum-faint',
          ]"
        >
          <Check v-if="step.isDone" class="h-3 w-3 text-on-mint" />
          <span
            v-else-if="idx === 0 || steps[idx - 1]?.isDone"
            class="h-2 w-2 rounded-full bg-sand"
          />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p
            :class="[
              'font-body text-sm font-bold text-plum',
              step.isDone && 'line-through opacity-60',
            ]"
          >
            {{ step.label }}
          </p>
          <p class="font-body text-[13px] text-plum-muted mt-0.5">
            {{ step.sub }}
          </p>
        </div>

        <!-- Chevron or lock -->
        <ChevronRight
          v-if="step.isDone || idx === 0 || steps[idx - 1]?.isDone"
          class="h-4 w-4 shrink-0 text-plum-muted"
        />
        <Lock v-else class="h-4 w-4 shrink-0 text-plum-muted/40" />
      </button>
    </div>
  </div>
</template>
