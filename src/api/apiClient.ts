import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import axiosRetry from 'axios-retry'
import { APIError } from './apiTypes'
import { useGatekeeperStore } from '@/features/gatekeeper/stores/GatekeeperStore'

const commonConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  // 🎯 CRITICAL: Forces Axios to capture, store, and pass HttpOnly identity cookies across cross-origin ports
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

/**
 * 🛡️ PRIMARY NETWORK CLIENT
 * Utilized for all secure vertical-sliced queries and resource commands.
 * Runs through the request interceptor matrix and token validation sequences.
 */
const apiClient = axios.create(commonConfig)

/**
 * ⚡ ISOLATED LIFE-CYCLE AUTHENTICATION CLIENT
 * Explicitly dedicated to token refreshes, login registrations, and session revocations.
 * Completely free of standard request interceptor logic AND retry policies to prevent deadlocks or token reuse errors.
 */
export const authApiClient = axios.create({
  ...commonConfig,
  timeout: 5000 // Fast fail for identity validation drops to optimize UX
})

// 1. THE FORTIFIED RETRY MATRIX (Polly Retry Engine Alternative)
// 🎯 APPLIED EXCLUSIVELY TO RESOURCE API CALLS, NOT AUTH CALLS
axiosRetry(apiClient, {
  retries: 3,
  shouldResetTimeout: true,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error: AxiosError) => {
    const isIdempotent = axiosRetry.isNetworkOrIdempotentRequestError(error)
    const isTransientStatus = error.response?.status ? error.response.status >= 500 : false

    const badVerbs = ['post', 'patch']
    const method = error.config?.method?.toLowerCase() || ''
    if (badVerbs.includes(method)) {
      return false
    }

    return isIdempotent || isTransientStatus
  },
  // 🎯 FIXED: Change InternalAxiosRequestConfig to AxiosRequestConfig to satisfy axios-retry contracts
  onRetry: (retryCount: number, error: AxiosError, requestConfig: AxiosRequestConfig) => {
    console.warn(`[Network Engine]: Transient discrepancy detected. Retry attempt #${retryCount} scheduled for ${requestConfig.url}`)
  }
})

// 🎯 REQUEST INTERCEPTOR: Pure security token and metadata injection
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => { // 🔄 Force strict type here

    // 2. CRYPTOGRAPHIC ACCESS TOKEN INJECTION
    if (config.meta?.requiresAuth) {
      const authStore = useGatekeeperStore()
      const tokenResult = await authStore.getAccessToken()
      
      if (tokenResult.status === 200 && tokenResult.token) {
        config.headers.Authorization = `Bearer ${tokenResult.token}`
      } else {
        return Promise.reject(
          new APIError(
            401, 
            "Session Expired",
            "Your authentication token has lapsed. Please re-authenticate."
          )
        )
      }
    }
    
    return config // 🎯 This must remain an InternalAxiosRequestConfig
  },
  (error) => Promise.reject(error)
)

export default apiClient