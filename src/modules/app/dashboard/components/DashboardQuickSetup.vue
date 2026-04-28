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

interface Step {
  label: string
  sub: string
  isDone: boolean
}
withDefaults(
  defineProps<{
    steps?: Step[]
  }>(),
  {
    steps: () => [],
  },
)

const emit = defineEmits(['step-click'])
</script>

<template>
  <div class="rounded-xl border border-ash-border bg-white p-6">
    <h3 class="font-body text-lg font-bold text-plum">Quick Setup</h3>

    <div class="mt-6 flex flex-col gap-4">
      <button
        v-for="(step, idx) in steps"
        :key="idx"
        :class="[
          'flex items-center gap-4 rounded-lg px-4 py-3.5 text-left transition-colors',
          step.isDone
            ? 'bg-mint/20'
            : idx === 0 || steps[idx - 1]?.isDone
              ? 'bg-mint/20 hover:bg-mint/30'
              : 'border border-ash-border',
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
                ? 'bg-mint'
                : 'border-2 border-ash-border',
          ]"
        >
          <Check v-if="step.isDone" class="h-3 w-3 text-white" />
          <span
            v-else-if="idx === 0 || steps[idx - 1]?.isDone"
            class="h-2 w-2 rounded-full bg-white"
          />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p
            :class="[
              'font-body text-sm font-medium text-plum',
              step.isDone && 'line-through opacity-60',
            ]"
          >
            {{ step.label }}
          </p>
          <p class="font-body text-sm text-plum-muted mt-0.5">
            {{ step.sub }}
          </p>
        </div>

        <!-- Chevron or lock -->
        <ChevronRight
          v-if="step.isDone || idx === 0 || steps[idx - 1]?.isDone"
          class="h-4 w-4 shrink-0 text-ash"
        />
        <Lock v-else class="h-4 w-4 shrink-0 text-ash-light" />
      </button>
    </div>
  </div>
</template>
