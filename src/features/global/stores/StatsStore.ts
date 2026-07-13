import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {GetStatsResponse} from '../types/GlobalTypes'
import { getAsync } from '@/api/apiGetServices'
import { APIError } from '@/api/apiTypes';

export const useStatsStore = defineStore('statsStore', () => {

// Cancellation
  let feedController: AbortController | null = null;

    const stats = ref<GetStatsResponse | null>(null);

  const lastFetched = ref<string | null>(null);
  const retrievedAt = ref<string | null>(null); // Pure backend timestamp

  // Check if our data is fresh (less than 60 minutes old)
  const isCacheValid = computed(() => {
    if (!lastFetched.value) return false;
    
    const lastFetchTime = new Date(lastFetched.value).getTime();
    const currentTime = new Date().getTime();
    const oneHourInMs = 60 * 60 * 1000;

    return (currentTime - lastFetchTime) < oneHourInMs;
  });

  async function loadStats(forceSync = false): Promise<{ success: boolean; error: APIError | null }> {
    // Skip network trip entirely if cache is valid and sync isn't forced
    if (stats.value && isCacheValid.value && !forceSync) {
      return { success: true, error: null };
    }
    
    try {
    
            
  // Spawn a fresh controller instance for this specific execution pass
    feedController = new AbortController();

      // Note: Assuming getAsync is part of your API client layer
    const outcome = await getAsync<GetStatsResponse>('/api/global/stats', true, {} as GetStatsResponse,
        feedController.signal
      );

      // Consideration 2: Reconcile updates if data was retrieved
      if (outcome.isSuccess && outcome.value) {

        stats.value = outcome.value;
        lastFetched.value = outcome.value.lastUpdatedAt;
      } else {
        // Clear store list if server explicitly returned nothing/null to prevent stale state bleed
        stats.value = null
      }

          // Success! The caller handles toggling its loading state and grabbing data from the store reactively.
      return { success: true, error: null };
    
        } catch (err: any) {
          // Fail-safe catch-all wrapper
          return { 
            success: false, 
            error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') 
          };
        }

  }

  return {
    stats,
    loadStats
  };
});