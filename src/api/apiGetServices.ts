import apiClient from './apiClient'
import type { Result } from './apiTypes'
import { mapToApiError } from '@/utils/errorMapper'

/**
 * Executes a type-safe HTTP GET query and maps the raw API response data 
 * into a structured frontend Result<T> monad container.
 * 
 * @template T The structural contract expected back inside the Result.value payload.
 */
export async function getAsync<T>(
  url: string, 
  requiresAuth: boolean = false,
  fallbackValue?: T,
  signal?: AbortSignal // 🎯 Individual component abort controllers hook here cleanly
): Promise<Result<T>> {
  try {
    console.log(`[Get-Services] Transmitting query to [${url}]...`)

    // 🎯 1. FETCH RAW DATA: Pass the custom signal token straight to Axios config
    const response = await apiClient.get<T>(url, {
      meta: { requiresAuth }, //
      signal: signal // 🔒 Linked! Axios rejects with a CanceledError instantly if triggered.
    });

    console.log(`[Get-Services] Network transaction for [${url}] completed seamlessly.`)

    const payload = response.data //

    // 🎯 2. BLANK BODY HANDLING: Handle empty strings or 204 No-Content returns safely
    if (payload === undefined || payload === null || (typeof payload === 'string' && payload.trim() === '')) { //
      return {
        value: fallbackValue ?? ({} as T), //
        error: null, //
        isFailure: false, //
        isSuccess: true //
      }
    }

    // 🎯 3. WRAP SUCCESS: The raw payload becomes the '.value' of our Result monad
    return {
      value: payload, //
      error: null, //
      isFailure: false, //
      isSuccess: true //
    }

  } catch (error: any) {
    console.warn(`[Get-Services] Endpoint exception captured for [${url}]. Assessing error vectors...`)

    // 🚨 4. INDUSTRY EXCEPTION HANDLE: Check if the network exception was caused by user cancellation
    // CRITICAL: Checked first so local store hooks know it didn't crash; it was just cancelled.
    if (
      error?.name === 'CanceledError' || 
      error?.name === 'AbortError' || 
      error?.code === 'ERR_CANCELED' ||
      error?.message === 'canceled'
    ) {
      console.log(`[Get-Services] Request to [${url}] cleanly aborted via client token cancellation.`);
      
      return {
        value: null, //
        error: { 
          message: 'The network request was intentionally aborted.', 
          code: 'ABORTED' 
        } as any, //
        isFailure: true, //
        isSuccess: false //
      };
    }

    // Log diagnostic payload information for unmanaged backend debugging exceptions
    console.dir(error);
    console.log("📄 Raw Error Representation:", typeof error === 'object' ? JSON.stringify(error) : error);
    
    // 🎯 5. WRAP FAILURE: Turn Axios structural exceptions or ProblemDetails into a type-safe APIError
    const mappedError = mapToApiError(error) //

    return {
      value: null, //
      error: mappedError, //
      isFailure: true, //
      isSuccess: false //
    }
  }
}