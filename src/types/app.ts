
export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastOptions {
  type?: ToastType
  duration?: number
}

export interface ApiSuccessResponse<T> {
  message?: string
  data: T
}