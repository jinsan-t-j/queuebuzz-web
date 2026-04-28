import { defineStore } from 'pinia'
import {
  fetchUserSettings,
  updateUserSettings,
  clearQueueHistory,
  deleteAccount,
  type UserSettings,
} from '@/modules/app/settings/actions/settings.actions'
import { useAuthStore } from './auth.store'
import { useToast } from '@/composables/useToast'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    userSettings: null as UserSettings | null,
    isLoading: false,
    isSaving: false,
    error: null as string | null,
  }),

  actions: {
    async fetchSettings() {
      this.isLoading = true
      this.error = null
      try {
        const data = await fetchUserSettings()
        this.userSettings = data
        if (useAuthStore().user) {
          useAuthStore().user!.name = data.name
          useAuthStore().user!.tier = data.tier
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to load settings'
      } finally {
        this.isLoading = false
      }
    },

    async updateSettings(payload: Partial<UserSettings>) {
      this.isSaving = true
      this.error = null
      try {
        await updateUserSettings(payload)
        await this.fetchSettings()
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to save settings'
        throw err
      } finally {
        this.isSaving = false
      }
    },

    async clearAllHistory() {
      this.isLoading = true
      try {
        await clearQueueHistory()
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to clear history'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async deleteHostAccount() {
      this.isLoading = true
      const { showToast } = useToast()
      try {
        await deleteAccount()
        useAuthStore().clearSession()
        this.userSettings = null
        this.error = null
        showToast('Account deleted successfully')
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to delete account'
        showToast('Failed to delete account', { type: 'error' })
        throw err
      } finally {
        this.isLoading = false
      }
    },
  },
})
