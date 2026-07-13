import axios from 'axios'
import { APIError } from '@/api/apiTypes'

/**
 * Transforms raw network aberrations, intercepted framework drops, and 
 * local interceptor constraints into a unified frontend APIError model.
 */
export function mapToApiError(error: any): APIError {
  
  // 1. DIRECT PASSTHROUGH: Catch errors rejected locally by our request interceptor
  if (error instanceof APIError) {
    return error
  }

  // 2. AXIOS NETWORK RESPONSE: Received a distinct failure code from the gateway
  if (axios.isAxiosError(error) && error.response) {
    const data = error.response.data as any

    const status = data?.status || error.response.status || 400 
    const title = data?.title || getFallbackTitle(status)
    const detail = data?.detail || error.response.statusText || 'An unexpected server discrepancy occurred.'

    console.warn(`[Error-Mapper] Caught server response: [${status}] ${title}`) 

    return new APIError(
      status,
      title,
      detail,
      data?.definition 
    )
  }

  // 3. HARD NETWORK DROP: Request left the client but received no response (CORS, offline, etc.)
  if (axios.isAxiosError(error) && error.request) {
    return new APIError(
      0,
      'Network Connectivity Failure',
      'Could not establish a connection to OutScribed services. Verify your connection and try again.' 
    )
  }

  // 4. CLIENT RUNTIME EXCEPTION: Native JavaScript exceptions or uncaught runtime failures
  return new APIError(
    500,
    'Client Runtime Exception',
    error?.message || 'An unmanaged software failure occurred during operation execution.' 
  )
}

/**
 * 🏷️ HELPER: Generates meaningful fallback titles for raw status codes when data payload is missing
 */
function getFallbackTitle(status: number): string {
  switch (status) {
    case 401: return '401: Unauthorized'
    case 403: return '403: Forbidden'
    case 404: return '404: Not Found'
    case 500: return '500: Internal Server Error'
    default: return 'API Error' 
  }
}