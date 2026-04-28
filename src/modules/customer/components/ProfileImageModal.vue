<script setup lang="ts">
/**
 * @component ProfileImageModal
 * @description Async modal to show enlarged host profile image.
 */
import BaseModal from '@/components/base/BaseModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'

defineProps<{
  isOpen: boolean
  imageUrl: string
  name: string
}>()

defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <BaseModal :is-open="isOpen" @close="$emit('close')">
    <div class="flex flex-col items-center bg-white p-2">
      <img :src="imageUrl" :alt="name" class="aspect-square w-full rounded-[24px] object-cover" />
      <div class="p-6 text-center">
        <p class="font-display text-lg font-bold text-plum">{{ name }}</p>
        <BaseButton variant="ghost" size="sm" class="mt-4" @click="$emit('close')">
          Close
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
