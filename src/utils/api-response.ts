export interface ApiError {
  response?: {
    status?: number
    data?: {
      message?: string
      error?: string
      code?: string
    }
  }
}

export function getErrorMessage(e: unknown, fallback: string): string {
  const error = e as ApiError
  return error.response?.data?.message || error.response?.data?.error || fallback
}
