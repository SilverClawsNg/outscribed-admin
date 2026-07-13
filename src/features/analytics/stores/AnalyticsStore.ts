import { defineStore } from 'pinia';
import { ref } from 'vue';
import { APIError } from '@/api/apiTypes';
import type {AnalyticsDetailDto, AnalyticsListDto, GetAnalyticsListResponse} from '../types/AnalyticsTypes'
import { useAnalyticsListFilterStore } from './AnalyticsListFilterStore'
import { getAsync } from '@/api/apiGetServices'

class HashSetOrSet extends Set<string> {}

export const useAnalyticsStore = defineStore('analyticsStore', () => {

   // State
  const analytics = ref<AnalyticsListDto[]>([]);
  const analytic = ref<AnalyticsDetailDto | null>(null);

  //Filter
  const filterStore = useAnalyticsListFilterStore()

   // Loading and Tracking flags matching your C# states
  const isFetchingMore = ref<boolean>(false);
  const hasNext = ref<boolean>(false);
  const pointer = ref<string | number>('1');
  const anchor = ref<string | null>(null);
  const baseRoute = ref<string>('/api/analytics/checklist'); 
  const loadMoreError = ref<APIError | null>(null)
  const viewedRows = ref<Set<string>>(new Set());

  // Cancellation
  let feedController: AbortController | null = null;

  // 1. Initial Load Path
  async function loadAnalytics(apiPathWithFilters: string): Promise<{ success: boolean; error: APIError | null }> {

    reset()

    try {

        // Spawn a fresh controller instance for this specific execution pass
          feedController = new AbortController();

      // Note: Assuming getAsync is part of your API client layer
      const outcome = await getAsync<GetAnalyticsListResponse>(apiPathWithFilters, true, {} as GetAnalyticsListResponse,
        feedController.signal
      );

      // Consideration 1: Check if any error and immediately return to caller
      if (outcome.isFailure) {
        return { success: false, error: outcome.error || null };
      }
      
      // Consideration 2: Reconcile updates if data was retrieved
      if (outcome.isSuccess && outcome.value?.analytics?.length) {

        // Commit clean data to store state
        hasNext.value = outcome.value.hasNext;
        pointer.value = outcome.value.pointer;
        anchor.value = outcome.value.anchor;

        analytics.value = outcome.value.analytics;

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

  // 2. Infinite Scroll Path (LoadMore)
  async function loadMoreAnalytics() {

    if (isFetchingMore.value || !hasNext.value) return;

    isFetchingMore.value = true;

    try {

        // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();

        const nextPageUrl = filterStore.buildApiPath(baseRoute.value, pointer.value, anchor.value)

        const outcome = await getAsync<GetAnalyticsListResponse>(nextPageUrl, true, {} as GetAnalyticsListResponse,
          feedController.signal
        )

    if (outcome.isFailure) {
          if (outcome.error) {
            loadMoreError.value = outcome.error
          }
            else{
                loadMoreError.value = new APIError(
                    500,
                    'Unknown Error!',
                    'Unknown error occured while retrieving analytics. Refresh page and try again.'
                );
            }

            return
        }

    // Consideration 2: Reconcile updates if data was retrieved
         if (outcome.isSuccess && outcome.value?.analytics?.length) {
          // Reconcile updates against incoming block (handles slower message brokers)
          
          // Commit clean data to store state
          hasNext.value = outcome.value.hasNext;
          pointer.value = outcome.value.pointer;
          
          // Filter duplicates already caught by state or top navigation creations
          const existingIds = new HashSetOrSet(analytics.value.map(t => t.analyticsId));
          // 1. Filter out duplicates and immediately shape the raw inputs into valid DTO structures
          const freshItems = outcome.value.analytics
            .filter((t: any) => !existingIds.has(t.analyticsId));

           analytics.value.push(...freshItems);
      
        } else{ 
          // stop infinite scrolling by setting has next to false
          hasNext.value = false
          pointer.value ='-1'
        }
       
        } catch (err) {
            console.error("Handled gracefully:", err)
          }finally {
          isFetchingMore.value = false;
        }

  }
  
      // 1. Initial Load Path
    async function loadAnalytic(analyticId: string): Promise<{ success: boolean; error: APIError | null }> {
    
      try {
    
        analytic.value = null
    
          // Spawn a fresh controller instance for this specific execution pass
            feedController = new AbortController();
    
        // Note: Assuming getAsync is part of your API client layer
        const outcome = await getAsync<AnalyticsDetailDto>(`api/analytics/checklist/${analyticId}`, true, {} as AnalyticsDetailDto, feedController.signal);
    
        // Consideration 1: Check if any error and immediately return to caller
        if (outcome.isFailure) {
          return { success: false, error: outcome.error || null };
        }
        
        // Inside profileStore.ts fallback block
        if (!outcome.value) {
          
          // 🎯 Instantiate your exact class blueprint with matching parameters
          const error = new APIError(
            204,
            'No Content!',
            'We could not find the analytic you requested. It may have been removed, hidden, or archived.'
          )
          
              return { success: false, error: error }
        }
    
       analytic.value = outcome.value;
    
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
  

  // 3. Reset State
 function reset() {
    analytics.value = [];
    pointer.value = '1';
    hasNext.value = false;
    anchor.value = null;
    isFetchingMore.value = false;
    loadMoreError.value = null;
  }

   // 4. Sets the target tale before a modal opens
  function setBaseRoute(apiUrl: any) {
    // We clone it using spread operator so the user doesn't alter 
    // the background list until they actually hit 'Save'
    baseRoute.value = apiUrl;
  }

  // 5. Abort request
  function abort() {
    if (feedController) {
      feedController.abort();
      feedController = null;
      console.log('[Store]: Requests successfully canceled.');
    }
      
  }
   return {
    analytics, analytic, isFetchingMore, loadMoreError,hasNext, pointer, baseRoute, viewedRows,
    setBaseRoute, loadAnalytics, loadMoreAnalytics, loadAnalytic, reset, abort
  };

});