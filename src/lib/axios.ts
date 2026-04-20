import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { API_BASE_URL } from '@/config/api.constants'
import { keysToCamelCase, keysToSnakeCase } from '@/utils/caseConvert'

export function createApiRequestConfig(
  config: AxiosRequestConfig = {},
  options: { withCredentials?: boolean; skipLogout?: boolean } = {},
) {
  return {
    ...config,
    withCredentials: options.withCredentials ?? false,
    _skipLogout: options.skipLogout ?? false,
  } as AxiosRequestConfig & { _skipLogout?: boolean }
}

/**
 * Global Axios Instance
 * Pre-configured with base URL, headers, and basic interceptors.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.data) {
      config.data = keysToSnakeCase(config.data)
    }

    if (config.params) {
      config.params = keysToSnakeCase(config.params)
    }

    return config
  },
  (error: unknown) => Promise.reject(error),
)

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
  _skipLogout?: boolean
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    response.data = keysToCamelCase(response.data)
    return response.data
  },
  async (error: { config: CustomInternalAxiosRequestConfig; response?: { status: number } }) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/refresh/token')) {
        return Promise.reject(error)
      }

      // If another request is already refreshing the token, pause this one
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await axios.post(`${API_BASE_URL}/auth/refresh/token`, undefined, {
          withCredentials: true,
        })

        processQueue(null)

        return apiClient(originalRequest)
      } catch (err: unknown) {
        processQueue(err)

        if (!originalRequest._skipLogout) {
          sessionStorage.setItem('qb_toast', 'Session expired.')
          window.location.href = '/'
        }

        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)
