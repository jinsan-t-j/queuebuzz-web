<script setup>
import { computed } from 'vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import CloseXIcon from '@/assets/icons/close-x.svg?component'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'submit'])

const schema = yup.object({
  name: yup.string().required('Guest name is required'),
  contactInfo: yup.string().nullable(),
})

const { handleSubmit, errors, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    name: '',
    contactInfo: '',
  },
})

const { value: name } = useField('name')
const { value: contactInfo } = useField('contactInfo')

const onSubmit = handleSubmit((values) => {
  emit('submit', values)
  resetForm()
})

function handleClose() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-show="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/25"
    >
      <div 
        class="relative w-full max-w-[448px] rounded-[48px] bg-[#f8f8f8] px-16 pb-12 pt-10 text-center shadow-[0_30px_70px_rgba(0,0,0,0.10)]"
      >
        <!-- Close button -->
        <button
          type="button"
          class="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-lg text-plum/40 transition-colors hover:bg-plum/5 hover:text-plum"
          @click="handleClose"
        >
          <CloseXIcon class="h-3 w-3" />
        </button>

        <h2 class="font-display text-[30px] font-semibold leading-9 tracking-tight text-plum mb-6">
          Add Guest
        </h2>

        <form @submit.prevent="onSubmit" class="text-left">
          <div class="mb-4">
            <label class="mb-2 block font-body text-xs font-bold uppercase tracking-[0.6px] text-[#64748b]">
              Guest Name <span class="text-red-500">*</span>
            </label>
            <input
              v-model="name"
              placeholder="e.g. Jane Doe"
              class="w-full rounded-[14px] border px-[18px] py-3 font-body text-base text-plum placeholder:text-ash outline-none transition-colors focus:border-plum"
              :class="errors.name ? 'border-red-500' : 'border-plum-faint'"
            />
            <span v-if="errors.name" class="text-xs text-red-500 font-body">{{ errors.name }}</span>
          </div>

          <div class="mb-8">
            <label class="mb-2 block font-body text-xs font-bold uppercase tracking-[0.6px] text-[#64748b]">
              Email or Phone (Optional)
            </label>
            <input
              v-model="contactInfo"
              placeholder="e.g. jane@example.com or +1 234..."
              class="w-full rounded-[14px] border border-plum-faint px-[18px] py-3 font-body text-base text-plum placeholder:text-ash outline-none transition-colors focus:border-plum"
            />
          </div>

          <div class="flex gap-4">
            <button
              type="button"
              class="flex-1 rounded-2xl bg-white border border-plum/10 px-8 py-3.5 font-body text-sm font-semibold uppercase tracking-[0.35px] text-plum transition-colors hover:bg-sand"
              @click="handleClose"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="flex-1 rounded-2xl bg-mint px-8 py-3.5 font-body text-sm font-semibold uppercase tracking-[0.35px] text-plum shadow-[0_2px_4px_rgba(128,229,192,0.20),0_4px_6px_rgba(128,229,192,0.20)] transition-colors hover:bg-mint-dark"
            >
              Add Guest
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
