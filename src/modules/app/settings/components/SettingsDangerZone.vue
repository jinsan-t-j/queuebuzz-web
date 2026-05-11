<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import { useSettingsStore } from '@/stores/settings.store'

const ClearQueueHistoryConfirmModal = defineAsyncComponent(
  () => import('./ClearQueueHistoryConfirmModal.vue'),
)
const DeleteAccountConfirmModal = defineAsyncComponent(
  () => import('./DeleteAccountConfirmModal.vue'),
)

const settingsStore = useSettingsStore()
const router = useRouter()

const showClearHistoryModal = ref(false)
const showDeleteAccountModal = ref(false)
const isLoading = ref(false)

async function confirmClearHistory() {
  isLoading.value = true
  try {
    await settingsStore.clearAllHistory()
    showClearHistoryModal.value = false
  } finally {
    isLoading.value = false
  }
}

async function confirmDeleteAccount() {
  isLoading.value = true
  try {
    await settingsStore.deleteHostAccount()
    showDeleteAccountModal.value = false
    router.push('/login')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div
    id="danger"
    class="scroll-mt-32 rounded-[32px] border border-danger/20 bg-danger/5 p-5 sm:p-8"
  >
    <h2 class="mb-6 font-display text-xl sm:text-2xl font-bold text-danger-dark">Danger Zone</h2>

    <div class="flex flex-col gap-4">
      <div
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm dark:shadow-none border border-danger/10"
      >
        <div class="flex-1">
          <p class="font-body font-bold text-plum">Clear Queue History</p>
          <p class="font-body text-sm text-plum-muted">
            Wipe all past session records permanently.
          </p>
        </div>
        <BaseButton
          variant="danger"
          size="sm"
          class="w-full sm:w-auto"
          @click="showClearHistoryModal = true"
        >
          Clear All
        </BaseButton>
      </div>

      <div
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm dark:shadow-none border border-danger/10"
      >
        <div class="flex-1">
          <p class="font-body font-bold text-plum text-danger-dark">Delete Account</p>
          <p class="font-body text-sm text-plum-muted">
            Permanently remove your profile and all data.
          </p>
        </div>
        <BaseButton
          variant="danger"
          size="sm"
          class="w-full sm:w-auto"
          @click="showDeleteAccountModal = true"
        >
          Delete Me
        </BaseButton>
      </div>
    </div>

    <!-- Modals -->
    <ClearQueueHistoryConfirmModal
      :is-open="showClearHistoryModal"
      :is-loading="isLoading"
      @cancel="showClearHistoryModal = false"
      @confirm="confirmClearHistory"
    />
    <DeleteAccountConfirmModal
      :is-open="showDeleteAccountModal"
      :is-loading="isLoading"
      @cancel="showDeleteAccountModal = false"
      @confirm="confirmDeleteAccount"
    />
  </div>
</template>
