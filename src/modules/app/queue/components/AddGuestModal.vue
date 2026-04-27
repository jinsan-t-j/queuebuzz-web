<script setup lang="ts">
/**
 * @component AddGuestModal
 * @description Modal for hosts to manually add guests to the queue.
 */
import { ref, computed } from 'vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import CloseXIcon from '@/assets/icons/close-x.svg?component'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import { useLiveQueue } from '@/modules/app/queue/composables/useLiveQueue'

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'submit'])

const { canJoinWithParty, maxAllowedPartySize } = useLiveQueue()

const schema = computed(() =>
  yup.object({
    name: yup.string().required('Guest name is required'),
    phone: yup.string().nullable(),
    accompanying: yup
      .number()
      .min(0)
      .max(
        Math.max(0, maxAllowedPartySize.value - 1),
        canJoinWithParty.value
          ? `Maximum ${maxAllowedPartySize.value - 1} accompanying guests allowed`
          : 'Party joining is not allowed for this queue',
      )
      .default(0),
  }),
)

const { handleSubmit, errors, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    name: '',
    phone: '',
    accompanying: 0,
  },
})

const { value: name } = useField<string>('name')
const { value: phone } = useField<string | null>('phone')
const { value: accompanying } = useField<number>('accompanying')

const isGuestsOpen = ref(false)

const onSubmit = handleSubmit((values) => {
  emit('submit', {
    name: values.name,
    partySize: (values.accompanying || 0) + 1,
  })
  resetForm()
})

const handleClose = () => {
  resetForm()
  emit('close')
}
</script>

<template>
  <BaseModal :is-open="isOpen" @close="handleClose">
    <div
      class="relative w-full rounded-[48px] bg-[#f8f8f8] px-16 pb-12 pt-10 text-center shadow-[0_30px_70px_rgba(0,0,0,0.10)]"
    >
      <!-- Close button -->
      <button
        type="button"
        class="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-lg text-plum/40 transition-colors hover:bg-plum/5 hover:text-plum cursor-pointer"
        @click="handleClose"
      >
        <CloseXIcon class="h-3 w-3" />
      </button>

      <h2 class="font-display text-[30px] font-semibold leading-9 tracking-tight text-plum mb-6">
        Add Guest
      </h2>

      <form class="text-left space-y-6" @submit.prevent="onSubmit">
        <div class="space-y-4">
          <BaseInput
            v-model="name"
            label="Full Name"
            placeholder="e.g. Jane Doe"
            :error="errors.name"
          />

          <BaseInput
            v-model="phone"
            label="Contact Info (Optional)"
            placeholder="e.g. +91 98765 43210"
          />
        </div>

        <!-- Smart Progressive Disclosure Row -->
        <div v-if="canJoinWithParty" class="space-y-2">
          <button
            type="button"
            class="w-full flex items-center justify-between py-2 group transition-all cursor-pointer"
            @click="isGuestsOpen = !isGuestsOpen"
          >
            <div class="flex items-center gap-4">
              <!-- Status Dot Indicator -->
              <div class="relative flex items-center justify-center">
                <div
                  v-if="accompanying > 0"
                  class="absolute w-3 h-3 bg-mint rounded-full blur-[4px] animate-pulse opacity-60"
                />
                <div
                  class="relative w-2.5 h-2.5 rounded-full transition-all duration-500"
                  :class="accompanying > 0 ? 'bg-mint scale-125' : 'bg-plum-faint'"
                />
              </div>

              <div class="flex flex-col items-start leading-tight">
                <span
                  class="font-body text-sm transition-all duration-300"
                  :class="
                    accompanying > 0
                      ? 'text-plum font-bold text-base'
                      : 'text-plum-muted group-hover:text-plum'
                  "
                >
                  {{
                    accompanying > 0
                      ? `Joining as party of ${accompanying + 1}`
                      : 'Add accompanying guests'
                  }}
                </span>
                <p
                  class="font-body text-sm text-plum-muted font-medium uppercase tracking-[0.05em] mt-0.5"
                >
                  {{ accompanying > 0 ? `Head of Party + ${accompanying} others` : 'Solo entry' }}
                </p>
              </div>
            </div>

            <svg
              :class="[
                'w-4 h-4 text-plum-muted cursor-pointer transition-transform duration-300',
                isGuestsOpen ? 'rotate-180' : '',
              ]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <div
            v-show="isGuestsOpen"
            class="pb-6 pt-2 px-1 animate-in fade-in slide-in-from-top-1 duration-300"
          >
            <div
              class="flex items-center justify-between bg-white rounded-2xl border border-plum-faint p-2 shadow-sm"
            >
              <div class="flex flex-col ml-3 relative h-10 justify-center">
                <transition
                  enter-active-class="transition-all duration-300 ease-out"
                  enter-from-class="opacity-0 translate-y-2"
                  enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="absolute transition-all duration-200 ease-in"
                  leave-from-class="opacity-100 translate-y-0"
                  leave-to-class="opacity-0 -translate-y-2"
                >
                  <span
                    v-if="accompanying < maxAllowedPartySize - 1"
                    key="label"
                    class="font-body text-sm text-plum-muted"
                  >
                    How many are there?
                  </span>
                  <div v-else key="error" class="flex flex-col leading-tight">
                    <span class="text-sm font-bold text-danger uppercase tracking-tight"
                      >Limit reached</span
                    >
                    <span class="text-sm font-body text-plum-muted"
                      >Max {{ maxAllowedPartySize - 1 }} more guests only</span
                    >
                  </div>
                </transition>
              </div>

              <div class="flex items-center gap-4">
                <button
                  type="button"
                  class="w-10 h-10 flex items-center justify-center rounded-xl bg-sand/50 text-plum hover:bg-sand transition-colors disabled:opacity-20 cursor-pointer"
                  :disabled="accompanying === 0"
                  @click="accompanying = Math.max(0, accompanying - 1)"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2.5"
                      d="M20 12H4"
                    />
                  </svg>
                </button>

                <span class="font-mono text-xl font-bold text-plum w-6 text-center">
                  {{ accompanying }}
                </span>

                <button
                  type="button"
                  class="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300"
                  :class="
                    accompanying >= maxAllowedPartySize - 1
                      ? 'bg-plum-faint text-plum-muted/40 cursor-not-allowed'
                      : 'bg-plum text-white hover:bg-plum-soft active:scale-95 shadow-md shadow-plum/10 cursor-pointer'
                  "
                  :disabled="accompanying >= maxAllowedPartySize - 1"
                  @click="accompanying = Math.min(maxAllowedPartySize - 1, accompanying + 1)"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2.5"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-4 pt-3">
          <BaseButton
            variant="ghost"
            class="flex-1 py-4.5 rounded-3xl font-semibold"
            @click="handleClose"
          >
            Cancel
          </BaseButton>
          <BaseButton
            type="submit"
            variant="primary"
            class="flex-1 py-4.5 rounded-3xl font-bold shadow-xl shadow-mint/20"
          >
            Add to Queue
          </BaseButton>
        </div>
      </form>
    </div>
  </BaseModal>
</template>
