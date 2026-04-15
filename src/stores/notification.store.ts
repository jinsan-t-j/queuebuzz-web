import { defineStore } from 'pinia'

export type AppNotification = {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  createdAt: number
  isRead: boolean
  dedupeKey?: string
}

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [] as AppNotification[],
    history: [] as AppNotification[],
  }),

  getters: {
    unreadCount: (state) => state.history.filter((n) => !n.isRead).length,
  },

  actions: {
    addNotification(payload: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) {
      const dedupeKey = payload.dedupeKey
      if (dedupeKey) {
        const recentMatch = this.history.find(
          (notification) =>
            notification.dedupeKey === dedupeKey && Date.now() - notification.createdAt < 4000,
        )

        if (recentMatch) {
          return recentMatch.id
        }
      }

      const id = Math.random().toString(36).substring(2, 9)
      const newNotif: AppNotification = {
        id,
        createdAt: Date.now(),
        isRead: false,
        ...payload,
      }

      this.notifications.push(newNotif)

      this.history.unshift(newNotif)

      if (this.history.length > 50) {
        this.history.pop()
      }

      setTimeout(() => {
        this.removeActiveNotification(id)
      }, 5000)

      return id
    },

    removeActiveNotification(id: string) {
      this.notifications = this.notifications.filter((n) => n.id !== id)
    },

    markAllRead() {
      this.history.forEach((n) => (n.isRead = true))
    },

    clearHistory() {
      this.history = []
    },

    clearNotifications() {
      this.notifications = []
      this.history = []
    },
  },
  persist: true,
})
