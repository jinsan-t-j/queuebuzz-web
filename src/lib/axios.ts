import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { API_BASE_URL } from '@/config/api.constants'

/**
 * Global Axios Instance
 * Pre-configured with base URL, headers, and basic interceptors.
 * Designed for optimized memory usage matching tanstack-query paradigms.
 */
export const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Set a standard timeout to avoid hanging requests (performance optimization)
    timeout: 15000,
})

// Optional: Request Interceptor
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // You can attach authentication tokens here later
        return config
    },
    (error: any) => Promise.reject(error)
)

// Optional: Response Interceptor
apiClient.interceptors.response.use(
    // Automatically unwrap standard axios data envelope
    (response: AxiosResponse) => response.data,
    (error: any) => Promise.reject(error)
)
