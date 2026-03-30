
export type ToastType = 'success' | 'error' | 'info'

export interface ToastOptions {
  type?: ToastType
  duration?: number
}

export interface ApiSuccessResponse<T> {
  message?: string
  data: T
}