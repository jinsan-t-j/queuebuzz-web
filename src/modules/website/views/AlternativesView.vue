<script setup lang="ts">
import { ArrowRightIcon } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

import { ALTERNATIVES } from '@/modules/website/content/alternatives'
</script>

<template>
  <div class="legal-page">
    <section
      class="mx-auto max-w-[720px] px-5 pt-10 pb-8 md:px-0 md:pt-[80px] md:pb-[48px] text-center md:text-left border-b border-plum-faint mb-8 md:mb-12"
    >
      <div
        class="text-plum-muted uppercase font-body font-medium text-sm tracking-widest mb-2 md:mb-[12px]"
      >
        ALTERNATIVES
      </div>
      <h1
        class="font-display font-bold text-plum text-[32px] md:text-[48px] tracking-[-0.02em] leading-tight mb-3"
      >
        QueueBuzz vs. the alternatives
      </h1>
      <p class="font-body text-plum-muted text-[14px] md:text-[16px] md:max-w-[480px] md:mx-0">
        See how QueueBuzz compares to other virtual queue and waitlist tools.
      </p>
    </section>

    <section class="mx-auto max-w-[720px] px-5 pb-[48px] md:px-0 md:pb-[80px]">
      <div class="flex flex-col gap-3">
        <RouterLink
          v-for="alt in ALTERNATIVES"
          :key="alt.slug"
          :to="{ name: 'alternative', params: { slug: alt.slug } }"
          class="group flex items-center justify-between gap-4 rounded-card border border-plum-faint px-5 py-4 transition-colors hover:border-mint-dark"
        >
          <span>
            <span class="block font-display font-bold text-[16px] text-plum"
              >QueueBuzz vs {{ alt.name }}</span
            >
            <span class="block font-body text-[13px] text-plum-muted mt-1">{{ alt.summary }}</span>
          </span>
          <ArrowRightIcon
            class="w-4 h-4 text-plum-muted shrink-0 transition-transform group-hover:translate-x-1"
          />
        </RouterLink>
      </div>
    </section>
  </div>
</template>
