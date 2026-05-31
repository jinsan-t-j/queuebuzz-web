<script setup lang="ts">
/**
 * @component ActiveWaitingBanner
 * @description Sleek premium visual alert shown to guests who have an active queue session,
 * enabling immediate tap-to-return navigation.
 */
import { ArrowRight, Ticket } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'

import BaseCard from '@/components/base/BaseCard.vue'
import { useCustomerStore } from '@/modules/customer/stores/customer.store'

defineProps({
  isFloating: {
    type: Boolean,
    default: false,
  },
})

const customerStore = useCustomerStore()
const { entry, position } = storeToRefs(customerStore)
</script>

<template>
  <transition
    enter-active-class="transition duration-500 ease-out"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
  >
    <div
      v-if="entry?.id"
      :class="[
        isFloating
          ? 'fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-6 w-full max-w-md pointer-events-none'
          : 'w-full max-w-md mx-auto z-15 px-4 mb-4 mt-2',
      ]"
    >
      <router-link
        :to="{ name: 'customer-waiting', params: { queueId: entry.queueId } }"
        :class="['block group cursor-pointer', isFloating ? 'pointer-events-auto' : '']"
      >
        <BaseCard
          class="relative overflow-hidden border border-mint bg-mint-light/45 p-4 shadow-[0_12px_40px_rgba(0,229,160,0.12)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_16px_48px_rgba(0,229,160,0.2)] active:scale-98"
        >
          <!-- Floating background glow matching theme -->
          <div
            class="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-mint/20 blur-xl"
          />

          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <!-- Ticket Icon with pulsing border -->
              <div
                class="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-plum shadow-sm border border-mint/20"
              >
                <Ticket class="h-5 w-5 text-plum" />
                <span class="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                  <span
                    class="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75"
                  />
                  <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-mint" />
                </span>
              </div>

              <!-- Message details -->
              <div class="text-left">
                <p class="font-display text-sm font-black text-plum tracking-tight">
                  Your place in line is active
                </p>
                <p class="font-body text-xs text-plum-soft mt-0.5">
                  Ticket
                  <span class="font-mono font-bold text-plum-muted">{{
                    customerStore.getDisplayTicketNumber(entry)
                  }}</span>
                  · Currently number
                  <span class="font-mono font-bold text-plum">{{ position ?? '?' }}</span> in line
                </p>
              </div>
            </div>

            <!-- Navigation Indicator -->
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-plum shadow-xs group-hover:bg-plum group-hover:text-sand transition-all duration-300"
            >
              <ArrowRight class="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </BaseCard>
      </router-link>
    </div>
  </transition>
</template>
