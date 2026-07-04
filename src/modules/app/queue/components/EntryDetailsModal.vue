<script setup lang="ts">
/**
 * @component EntryDetailsModal
 * @description Detailed information modal for a single queue entry.
 * Allows hosts to see guest details and take actions like Call, Serve, or Skip.
 */
import { computed } from 'vue'

import PartyIcon from '@/assets/icons/add-person.svg?component'
import CallNextIcon from '@/assets/icons/call-next.svg?component'
import CheckIcon from '@/assets/icons/check-mint.svg?component'
import ClockTimeIcon from '@/assets/icons/clock-time.svg?component'
import CloseXIcon from '@/assets/icons/close-x.svg?component'
import QrScanIcon from '@/assets/icons/qr-code-scan.svg?component'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import { ENTRY_STATUS } from '@/modules/app/queue/constants'
import { useQueueStore } from '@/stores/queue.store'

import TicketPrintTemplate from './TicketPrintTemplate.vue'

import type { QueueEntry } from '../types'

const props = withDefaults(
  defineProps<{
    entry: QueueEntry
    isOpen: boolean
    avgServiceMins: number
    showPartySize: boolean
    canViewGuestData?: boolean
  }>(),
  {
    canViewGuestData: false,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'call', id: string): void
  (e: 'serve', id: string): void
  (e: 'skip', id: string): void
  (e: 'verify', id: string): void
  (e: 'upgrade'): void
}>()

const statusConfig = computed(() => {
  if (!props.entry) return { label: '', color: '' }
  switch (props.entry.status) {
    case ENTRY_STATUS.WAITING:
      return { label: 'Waiting in line', color: 'bg-warning/10 text-warning' }
    case ENTRY_STATUS.CALLED:
      return { label: 'Currently Called', color: 'bg-mint text-on-mint font-bold' }
    case ENTRY_STATUS.SERVED:
      return { label: 'Successfully Served', color: 'bg-mint/10 text-mint' }
    case ENTRY_STATUS.SKIPPED:
      return { label: 'Skipped Turn', color: 'bg-danger/10 text-danger' }
    case ENTRY_STATUS.ARRIVED:
      return { label: 'Confirmed Arrival', color: 'bg-mint text-on-mint font-bold' }
    case ENTRY_STATUS.IDLE:
      return { label: 'No Show (In Grace Period)', color: 'bg-warning/10 text-warning font-bold' }
    default:
      return { label: String(props.entry.status).toUpperCase(), color: 'bg-plum/10 text-plum' }
  }
})

const formattedJoinedTime = computed(() => {
  if (!props.entry.createdAt) return ''
  try {
    return new Date(props.entry.createdAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
})

const estWaitMin = computed(() => {
  if (props.entry.status !== ENTRY_STATUS.WAITING || !props.entry.position) return 0
  return Math.max(0, (props.entry.position - 1) * (props.avgServiceMins || 0))
})

const queueStore = useQueueStore()

const guestQrUrl = computed(() => {
  if (!queueStore.activeQueue) return ''
  const slugOrId = queueStore.activeQueue.slug || queueStore.activeQueue.id
  return `${globalThis.location?.origin || ''}/q/${slugOrId}/status`
})

const formattedJoinDate = computed(() => {
  if (!props.entry.createdAt) return ''
  try {
    return new Date(props.entry.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return ''
  }
})

function printTicket() {
  globalThis.print?.()
}
</script>

<template>
  <BaseModal :is-open="isOpen" @close="emit('close')">
    <div class="relative bg-white dark:bg-transparent">
      <!-- Close button -->
      <button
        class="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-sand dark:bg-plum-faint/30 cursor-pointer transition-colors hover:bg-plum/5 dark:hover:bg-plum-faint/50"
        @click="emit('close')"
      >
        <CloseXIcon class="h-4 w-4 text-plum/40 dark:text-plum" />
      </button>

      <div class="p-6">
        <!-- Header: Ticket & Status -->
        <div class="mb-8 pt-4 text-center">
          <span class="font-mono text-[64px] font-bold leading-none tracking-tight text-plum">
            #{{ entry.ticketNo.toString().padStart(3, '0') }}
          </span>
          <div class="mt-4 flex justify-center">
            <BaseBadge :class="statusConfig.color">
              {{ statusConfig.label }}
            </BaseBadge>
          </div>
        </div>

        <!-- Quick Info Grid -->
        <div class="mb-8 grid grid-cols-2 gap-3">
          <!-- Party Size -->
          <div
            v-if="showPartySize"
            class="flex flex-col items-center justify-center rounded-2xl bg-sand dark:bg-plum-faint/30 p-5 text-center transition-all hover:bg-sand/80 dark:hover:bg-plum-faint/50"
          >
            <span class="font-body text-sm font-bold uppercase tracking-widest text-plum-muted">
              Party Size
            </span>
            <div class="mt-2 flex items-center gap-2">
              <PartyIcon class="h-5 w-5 text-plum/40 dark:text-plum" />
              <span class="font-body text-2xl font-bold text-plum">
                {{ entry.partySize }}
              </span>
            </div>
          </div>

          <!-- Est. Wait -->
          <div
            class="flex flex-col items-center justify-center rounded-2xl bg-sand dark:bg-plum-faint/30 p-5 text-center transition-all hover:bg-sand/80 dark:hover:bg-plum-faint/50"
            :class="{ 'col-span-2': !showPartySize }"
          >
            <span class="font-body text-sm font-bold uppercase tracking-widest text-plum-muted">
              Est. Wait
            </span>
            <div class="mt-2 flex items-center gap-2 text-plum">
              <ClockTimeIcon class="h-5 w-5 text-plum/40 dark:text-plum" />
              <span class="font-body text-2xl font-bold">
                {{ estWaitMin }}<span class="text-sm">m</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Details List -->
        <div class="space-y-4 border-t border-plum-faint dark:border-plum-faint/50 pt-6 px-2">
          <div class="flex items-center justify-between">
            <span class="font-body text-sm text-plum-muted">Guest Name</span>
            <span class="font-body text-base font-bold text-plum">{{ entry.name }}</span>
          </div>
          <div v-if="entry.email" class="flex items-center justify-between">
            <span class="font-body text-sm text-plum-muted">Email Address</span>
            <div class="flex items-center gap-2">
              <span class="font-body text-base font-bold text-plum">{{ entry.email }}</span>
              <a
                v-if="canViewGuestData"
                :href="`mailto:${entry.email}`"
                class="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-mint-light hover:bg-mint/20 text-plum transition-all duration-200 cursor-pointer"
                title="Send Email"
              >
                <svg
                  class="h-4 w-4 text-plum"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </a>
              <span
                v-else
                class="inline-flex items-center justify-center text-warning hover:text-warning/80"
                title="Premium Feature"
              >
                <svg
                  class="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </span>
            </div>
          </div>
          <div v-if="entry.phone" class="flex items-center justify-between">
            <span class="font-body text-sm text-plum-muted">Phone Number</span>
            <div class="flex items-center gap-2">
              <span class="font-body text-base font-bold text-plum">{{ entry.phone }}</span>
              <a
                v-if="canViewGuestData"
                :href="`tel:${entry.phone}`"
                class="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-mint-light hover:bg-mint/20 text-plum transition-all duration-200 cursor-pointer"
                title="Call Guest"
              >
                <svg
                  class="h-4 w-4 text-plum"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </a>
              <span
                v-else
                class="inline-flex items-center justify-center text-warning hover:text-warning/80"
                title="Premium Feature"
              >
                <svg
                  class="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </span>
            </div>
          </div>
          <div v-if="entry.createdBy" class="flex items-center justify-between">
            <span class="font-body text-sm text-plum-muted">Source</span>
            <span class="font-body text-sm font-bold text-plum">Added by host</span>
          </div>
          <div v-if="formattedJoinedTime" class="flex items-center justify-between">
            <span class="font-body text-sm text-plum-muted">Joined At</span>
            <span class="font-body text-base font-bold text-plum">{{ formattedJoinedTime }}</span>
          </div>
          <div
            v-if="
              entry.verifyCode &&
              ([ENTRY_STATUS.CALLED, ENTRY_STATUS.ARRIVED, ENTRY_STATUS.IDLE] as string[]).includes(
                entry.status,
              )
            "
            class="flex items-center justify-between"
          >
            <span class="font-body text-sm text-plum-muted">Verify Code</span>
            <span class="font-mono text-base font-bold tracking-[0.2em] text-plum">
              {{ entry.verifyCode }}
            </span>
          </div>
        </div>

        <!-- Upgrade Upsell Section -->
        <div
          v-if="!canViewGuestData && (entry.email || entry.phone)"
          class="mt-6 rounded-2xl border border-warning/20 bg-warning/[0.03] p-4 text-left relative overflow-hidden"
        >
          <!-- Lock decoration in bg -->
          <div class="absolute -right-3 -top-3 text-warning/10 select-none pointer-events-none">
            <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <div class="flex gap-3">
            <div
              class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning"
            >
              <svg
                class="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div class="flex-1">
              <h4 class="font-body text-xs font-bold uppercase tracking-wider text-plum">
                Unlock Contact Details
              </h4>
              <p class="font-body text-xs text-plum-muted mt-1 leading-relaxed">
                Upgrade to Premium to view full customer emails, phone numbers.
              </p>
              <button
                type="button"
                class="mt-3 inline-flex items-center gap-1 font-body text-xs font-bold text-warning hover:text-warning/80 transition-colors cursor-pointer"
                @click="emit('upgrade')"
              >
                <span>Upgrade Now</span>
                <svg
                  class="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-10 flex flex-col gap-3">
          <!-- If called, arrived or idle, show serve/re-call -->
          <div
            v-if="
              ([ENTRY_STATUS.CALLED, ENTRY_STATUS.ARRIVED, ENTRY_STATUS.IDLE] as string[]).includes(
                entry.status,
              )
            "
            class="flex flex-col gap-3"
          >
            <!-- Primary Action -->
            <BaseButton
              variant="primary"
              class="w-full py-4 text-base font-bold"
              @click="emit('serve', entry.id)"
            >
              <CheckIcon class="mr-2 h-5 w-5" />
              Mark as Served
            </BaseButton>

            <!-- Secondary Utility Row (Side-by-side) -->
            <div class="grid grid-cols-2 gap-3">
              <BaseButton
                variant="ghost"
                class="w-full border border-plum-faint font-semibold"
                @click="emit('verify', entry.id)"
              >
                <QrScanIcon class="mr-2 h-4 w-4" />
                Scan QR
              </BaseButton>
              <BaseButton
                variant="ghost"
                class="w-full border border-plum-faint font-semibold"
                @click="printTicket"
              >
                <svg
                  class="mr-2 h-4 w-4 text-plum-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Print Ticket
              </BaseButton>
            </div>

            <!-- Tertiary / Destructive Row -->
            <div
              v-if="([ENTRY_STATUS.ARRIVED, ENTRY_STATUS.IDLE] as string[]).includes(entry.status)"
              class="grid grid-cols-2 gap-3"
            >
              <BaseButton
                variant="ghost"
                class="w-full border border-plum-faint font-semibold"
                @click="emit('call', entry.id)"
              >
                <CallNextIcon class="mr-2 h-4 w-4 text-plum-muted" />
                {{ entry.status === ENTRY_STATUS.IDLE ? 'Call Again' : 'Re-call' }}
              </BaseButton>
              <BaseButton
                variant="ghost"
                class="w-full border border-danger/20 text-danger hover:bg-danger/5 font-semibold"
                @click="emit('skip', entry.id)"
              >
                <CloseXIcon class="mr-2 h-4 w-4" />
                Skip Guest
              </BaseButton>
            </div>
            <div v-else class="grid grid-cols-1">
              <BaseButton
                variant="ghost"
                class="w-full border border-danger/20 text-danger hover:bg-danger/5 font-semibold"
                @click="emit('skip', entry.id)"
              >
                <CloseXIcon class="mr-2 h-4 w-4" />
                Skip Guest
              </BaseButton>
            </div>

            <BaseButton variant="ghost" class="w-full text-plum-muted mt-2" @click="emit('close')">
              Close
            </BaseButton>
          </div>

          <!-- If waiting, show call -->
          <div v-else-if="entry.status == ENTRY_STATUS.WAITING" class="flex flex-col gap-3">
            <BaseButton
              variant="primary"
              class="w-full py-4 text-base font-bold"
              @click="emit('call', entry.id)"
            >
              <CallNextIcon class="mr-2 h-5 w-5" />
              Call Guest
            </BaseButton>

            <!-- Secondary Row side-by-side: Print & Skip -->
            <div class="grid grid-cols-2 gap-3">
              <BaseButton
                variant="ghost"
                class="w-full border border-plum-faint font-semibold"
                @click="printTicket"
              >
                <svg
                  class="mr-2 h-4 w-4 text-plum-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Print Ticket
              </BaseButton>
              <BaseButton
                variant="ghost"
                class="w-full border border-danger/20 text-danger hover:bg-danger/5 font-semibold"
                @click="emit('skip', entry.id)"
              >
                <CloseXIcon class="mr-2 h-4 w-4" />
                Skip Guest
              </BaseButton>
            </div>

            <BaseButton variant="ghost" class="w-full text-plum-muted mt-2" @click="emit('close')">
              Cancel
            </BaseButton>
          </div>

          <!-- Default close for other statuses -->
          <div v-else class="flex flex-col gap-3">
            <div class="grid grid-cols-2 gap-3">
              <BaseButton
                variant="ghost"
                class="w-full border border-plum-faint font-semibold"
                @click="printTicket"
              >
                <svg
                  class="mr-2 h-4 w-4 text-plum-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Print Ticket
              </BaseButton>
              <BaseButton variant="primary" class="w-full" @click="emit('close')">
                Close
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>

  <!-- Teleport container for printing the ticket -->
  <Teleport v-if="entry" to="body">
    <div id="print-ticket-container" class="hidden print:block">
      <TicketPrintTemplate
        :ticket-number="String(entry.ticketNo)"
        :queue-name="queueStore.activeQueue?.name || 'Visitor Queue'"
        :join-time="formattedJoinedTime"
        :join-date="formattedJoinDate"
        :qr-value="guestQrUrl"
      />
    </div>
  </Teleport>
</template>
