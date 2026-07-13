import apiClient from './apiClient'
import type { Result } from './apiTypes'
import { mapToApiError } from '@/utils/errorMapper'

/**
 * Robust POST request delivery vehicle that maps raw API responses
 * into a structured frontend Result<T> monad container.
 * * @template T The structural contract expected back inside the Result.value payload.
 * @template R The structured Request DTO / Payload contract template being sent.
 */
export async function postAsync<T, R = any>(
  url: string,
  formData: R,
  requiresAuth: boolean = false,
  signal?: AbortSignal, // 🎯 Abort controllers hook here to cancel flight requests cleanly
  fallbackValue?: T     // 🛡️ Safe initialization structure for empty body responses (e.g., 204 No Content)
): Promise<Result<T>> {
  
  console.log(`[Post-Services] Processing request for [${url}]...`)

  try {
    // 🎯 1. FETCH RAW DATA: Point Axios to expect the raw backend object <T> directly
    const response = await apiClient.post<T>(url, formData, {
      meta: { requiresAuth }, // Triggers authorization interceptor gate automatically if true
      signal: signal // 🔒 Connected cleanly to Axios abort pipeline
    })

    console.log(`[Post-Services] Happy path network delivery complete for [${url}].`)

    const payload = response.data

    // 🎯 2. BLANK BODY HANDLING: Safely handles 201 Created or 204 No Content with no response body
    if (payload === undefined || payload === null || (typeof payload === 'string' && payload.trim() === '')) {
      console.log("[Post-Services] Success: Request accepted with an empty return body.")

      // 🎯 FIXED: Replaced the 'true as unknown as T' boolean-injection hack with a clean fallback layout.
      // If a command returns empty, value becomes null or your designated layout object to protect views from crashing.
      return {
        value: (fallbackValue ?? null) as unknown as T,
        error: null,
        isFailure: false,
        isSuccess: true
      }
    }

    // 🎯 3. WRAP SUCCESS: Wrap the raw backend payload into the '.value' of our Result monad
    return {
      value: payload,
      error: null,
      isFailure: false,
      isSuccess: true
    }

  } catch (error: any) {
    console.warn(`[Post-Services] Error path encountered for [${url}]. Assessing error vectors... ${error?.message}`)

    // 🚨 4. INDUSTRY EXCEPTION HANDLE: Check if the network exception was caused by user cancellation
    // CRITICAL: Prioritized at the top of the catch block so cancellation actions don't pass through global parsing logic.
    if (
      error?.name === 'CanceledError' || 
      error?.name === 'AbortError' || 
      error?.code === 'ERR_CANCELED' ||
      error?.message === 'canceled'
    ) {
      console.log(`[Post-Services] Mutation request to [${url}] cleanly aborted.`);
      return {
        value: null,
        error: { 
          message: 'The mutation request was intentionally aborted.', 
          code: 'ABORTED' 
        } as any,
        isFailure: true,
        isSuccess: false
      };
    }
    
    // 🎯 5. WRAP FAILURE: Absorb Axios network drops or ProblemDetails into a structured failure Result
    const mappedError = mapToApiError(error)
    
    return {
      value: null,
      error: mappedError,
      isFailure: true,
      isSuccess: false
    }
  }
}