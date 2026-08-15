<script setup lang="ts">
import { Plus } from 'lucide-vue-next'

defineProps<{
  faqList: { question: string; answer: string }[]
  openFaqIdx: number | null
}>()

defineEmits<{ (e: 'toggle-faq', idx: number): void }>()
</script>

<template>
  <section id="faq" class="relative py-20 lg:py-28 overflow-hidden bg-white">
    <div class="container mx-auto px-6 relative z-10">
      <div class="grid lg:grid-cols-[minmax(0,340px)_1fr] gap-12 lg:gap-20 max-w-5xl mx-auto">
        <!-- Left: sticky header + contact CTA -->
        <div class="lg:sticky lg:top-28 lg:self-start">
          <p class="font-body text-sm font-semibold text-plum-muted mb-3">
            Deep dives &amp; doubts
          </p>
          <h2 class="font-editorial text-4xl font-bold text-plum tracking-tight">
            Questions, answered.
          </h2>
          <p class="mt-4 font-body text-plum-soft leading-relaxed">
            Can't find what you're looking for? Our team is happy to walk you through the details.
          </p>
          <router-link
            to="/support"
            class="mt-6 inline-flex items-center gap-2 rounded-full border border-plum-faint px-5 py-3 font-body text-sm font-semibold text-plum hover:border-mint/40 hover:bg-mint-light/30 transition-colors"
          >
            Talk to support
          </router-link>
        </div>

        <!-- Right: accordion -->
        <div class="divide-y divide-plum-faint border-t border-plum-faint">
          <div v-for="(f, i) in faqList" :key="i">
            <h3>
              <button
                type="button"
                class="w-full flex items-start gap-5 py-6 text-left group"
                :aria-expanded="openFaqIdx === i"
                @click="$emit('toggle-faq', i)"
              >
                <span
                  class="font-mono text-sm text-plum-muted pt-1 tabular-nums"
                  aria-hidden="true"
                  >{{ String(i + 1).padStart(2, '0') }}</span
                >
                <span
                  class="flex-1 font-body font-bold text-lg leading-snug transition-colors"
                  :class="openFaqIdx === i ? 'text-plum' : 'text-plum group-hover:text-mint-dark'"
                  >{{ f.question }}</span
                >
                <span
                  class="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-plum-faint transition-all duration-300"
                  :class="
                    openFaqIdx === i
                      ? 'rotate-45 border-mint bg-mint-light text-mint-dark'
                      : 'text-plum-muted'
                  "
                >
                  <Plus class="h-4 w-4" />
                </span>
              </button>
            </h3>
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="max-h-0 opacity-0"
              enter-to-class="max-h-96 opacity-100"
              leave-to-class="max-h-0 opacity-0"
            >
              <div v-show="openFaqIdx === i" class="overflow-hidden pl-[calc(1.5rem+0.75rem)]">
                <p class="pb-7 font-body text-plum-soft leading-relaxed max-w-xl">
                  {{ f.answer }}
                </p>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
