<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { ArrowLeftIcon, CheckIcon } from 'lucide-vue-next'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { useSchemaOrg } from '@/composables/useSchemaOrg'
import { getAlternative } from '@/modules/website/content/alternatives'

const route = useRoute()
const { injectAlternativeSchema } = useSchemaOrg()

const alt = computed(() => getAlternative(route.params.slug as string))

if (alt.value) {
  useHead({
    title: `QueueBuzz vs ${alt.value.name} — Which Virtual Queue Tool Is Right for You?`,
    meta: [{ name: 'description', content: alt.value.summary }],
  })
  injectAlternativeSchema(alt.value)
}
</script>

<template>
  <div class="legal-page">
    <section class="mx-auto max-w-[720px] px-5 pt-10 pb-8 md:px-0 md:pt-[80px] md:pb-[48px]">
      <RouterLink
        :to="{ name: 'alternatives' }"
        class="inline-flex items-center gap-1.5 font-body text-sm text-plum-muted hover:text-plum mb-6"
      >
        <ArrowLeftIcon class="w-4 h-4" />
        Alternatives
      </RouterLink>

      <template v-if="alt">
        <h1
          class="font-display font-bold text-plum text-[28px] md:text-[40px] tracking-[-0.02em] leading-tight mb-3"
        >
          QueueBuzz vs {{ alt.name }}
        </h1>
        <p class="font-body text-plum-muted text-[14px] md:text-[16px]">{{ alt.summary }}</p>
      </template>
      <template v-else>
        <h1 class="font-display font-bold text-plum text-[28px] md:text-[40px] mb-3">
          Comparison not found
        </h1>
      </template>
    </section>

    <section v-if="alt" class="mx-auto max-w-[720px] px-5 pb-[48px] md:px-0 md:pb-[80px]">
      <div class="flex flex-col gap-[32px] md:gap-[40px]">
        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            What to consider
          </h2>
          <ul
            class="list-disc pl-6 space-y-2 font-body text-[14px] md:text-[15px] text-plum leading-[1.7]"
          >
            <li v-for="(item, i) in alt.considerations" :key="i">{{ item }}</li>
          </ul>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            How QueueBuzz differs
          </h2>
          <ul class="space-y-3 font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            <li v-for="(item, i) in alt.queuebuzzDifference" :key="i" class="flex gap-2.5">
              <CheckIcon class="w-4 h-4 text-mint-dark shrink-0 mt-1" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            Frequently asked questions
          </h2>
          <div class="flex flex-col gap-5">
            <div v-for="(faq, i) in alt.faqs" :key="i">
              <p class="font-body font-bold text-[14px] md:text-[15px] text-plum mb-1">
                {{ faq.question }}
              </p>
              <p class="font-body text-[14px] md:text-[15px] text-plum-muted leading-[1.7]">
                {{ faq.answer }}
              </p>
            </div>
          </div>
        </article>

        <RouterLink
          :to="{ name: 'guest-host-create' }"
          class="rounded-lg bg-mint px-5 py-3.5 text-center font-body text-sm font-bold text-plum transition-colors duration-200 hover:bg-mint-dark hover:text-white inline-flex items-center justify-center w-fit"
        >
          Try QueueBuzz Free
        </RouterLink>
      </div>
    </section>
  </div>
</template>
