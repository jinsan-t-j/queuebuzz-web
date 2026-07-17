import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'

import { useToast } from '@/composables/useToast'
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

export interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
  _skipLogout?: boolean
}

const pendingRequests = new Map<string, Promise<AxiosResponse>>()

function getRequestKey(config: AxiosRequestConfig): string {
  const { method, url, params, data } = config
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&')
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
      if (config.data instanceof FormData) {
        if (config.headers) {
          delete config.headers['Content-Type']
        }
      } else {
        config.data = keysToSnakeCase(config.data)
      }
    }

    if (config.params) {
      config.params = keysToSnakeCase(config.params)
    }

    const isMutating = config.method !== 'get' && config.method !== 'options'
    const customConfig = config as CustomInternalAxiosRequestConfig

    if (isMutating && !customConfig._retry) {
      const key = getRequestKey(config)
      const existing = pendingRequests.get(key)
      if (existing !== undefined) {
        config.adapter = () => existing
      } else {
        const resolvedAdapter = axios.getAdapter(
          config.adapter || apiClient.defaults.adapter || 'xhr',
        )
        const adapterConfig = {
          ...config,
        }
        if (adapterConfig.transformRequest) {
          const transforms = Array.isArray(adapterConfig.transformRequest)
            ? adapterConfig.transformRequest
            : [adapterConfig.transformRequest]
          let data = adapterConfig.data
          for (const transform of transforms) {
            data = transform.call(adapterConfig, data, adapterConfig.headers)
          }
          adapterConfig.data = data
        }
        const promise = (async () => {
          try {
            const res = await resolvedAdapter(adapterConfig)
            pendingRequests.delete(key)
            return res
          } catch (err) {
            pendingRequests.delete(key)
            throw err
          }
        })()
        pendingRequests.set(key, promise)
        config.adapter = () => promise
      }
    }

    return config
  },
  (error: unknown) => {
    throw error
  },
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

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    response.data = keysToCamelCase(response.data)
    return response.data
  },
  async (error: {
    config: CustomInternalAxiosRequestConfig
    response?: { status: number; headers?: Record<string, string> }
  }) => {
    const originalRequest = error.config

    if (
      error.response &&
      (error.response.status === 503 || error.response.status === 429) &&
      originalRequest &&
      !originalRequest._retry
    ) {
      const retryAfterHeader = error.response.headers?.['retry-after']
      const retryAfterSeconds = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) : 3

      originalRequest._retry = true

      const { showToast } = useToast()
      showToast(`Server is busy. Retrying in ${retryAfterSeconds} seconds...`, { type: 'error' })

      await new Promise((resolve) => setTimeout(resolve, retryAfterSeconds * 1000))
      return apiClient(originalRequest)
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/refresh/token')) {
        throw error
      }

      // If another request is already refreshing the token, pause this one
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            return apiClient(originalRequest)
          })
          .catch((err) => {
            throw err
          })
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
          globalThis.location.href = '/login-or-signup'
        }

        throw err
      } finally {
        isRefreshing = false
      }
    }

    throw error
  },
)
