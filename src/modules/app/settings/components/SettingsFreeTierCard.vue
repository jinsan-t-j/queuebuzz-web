<script setup lang="ts">
/**
 * @component SettingsFreeTierCard
 * @description Premium-styled card shown to free-tier users in settings.
 */
import { Sparkles } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'

const router = useRouter()
</script>

<template>
  <BaseCard id="subscription" class="p-8">
    <div class="flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <h2 class="font-display text-2xl font-bold text-plum">Subscription</h2>
        <div
          class="flex items-center gap-1.5 rounded-full border border-plum-faint bg-sand px-3 py-1 font-body text-[10px] font-bold tracking-widest text-plum uppercase dark:bg-white dark:text-plum"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-mint" />
          Free Plan
        </div>
      </div>

      <div class="relative overflow-hidden rounded-3xl bg-plum p-8 text-sand">
        <!-- Subtle background decoration -->
        <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-mint opacity-20 blur-3xl" />
        <div
          class="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-mint opacity-10 blur-3xl"
        />

        <div
          class="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="max-w-md">
            <div class="mb-2 flex items-center gap-2">
              <Sparkles class="h-5 w-5 text-mint" />
              <span class="font-body text-sm font-bold uppercase tracking-wider text-mint">
                Unlock QueueBuzz Elite
              </span>
            </div>
            <p class="font-body text-lg font-semibold leading-tight text-white">
              Ready to take your business to the next level?
            </p>
            <p class="mt-2 font-body text-sm text-sand/70">
              Get custom branding, unlimited history, advanced analytics, and priority support.
            </p>
          </div>

          <BaseButton
            variant="primary"
            size="lg"
            class="w-full sm:w-auto shadow-lg shadow-mint/20 transition-transform hover:scale-105 active:scale-95"
            @click="router.push('/pricing')"
          >
            Upgrade Now
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseCard>
</template>
