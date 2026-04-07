export interface ApiError {
  response?: {
    status?: number
    data?: {
      message?: string
    }
  }
}

export function getErrorMessage(e: unknown, fallback: string): string {
  const error = e as ApiError
  return error.response?.data?.message || fallback
}
