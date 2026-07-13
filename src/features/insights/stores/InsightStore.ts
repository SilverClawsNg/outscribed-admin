import { defineStore } from 'pinia';
import { ref } from 'vue';
import { APIError } from '@/api/apiTypes';
import type {InsightListDto, GetInsightListResponse, InsightDetailDto, ConfirmRequest} from '../types/InsightTypes'
import { useInsightListFilterStore } from './InsightListFilterStore'
import { getAsync } from '@/api/apiGetServices'
import { postAsync } from '@/api/apiPostServices'

// Native JS Set wrapper implementation shortcut
class HashSetOrSet extends Set<string> {}

export const useInsightStore = defineStore('insightStore', () => {

   // State
  const insights = ref<InsightListDto[]>([]);
  const insight = ref<InsightDetailDto | null>(null);

  //Filter
  const filterStore = useInsightListFilterStore()

   // Loading and Tracking flags matching your C# states
  const isFetchingMore = ref<boolean>(false);
  const hasNext = ref<boolean>(false);
  const pointer = ref<string | number>('1');
  const anchor = ref<string | null>(null);
  const baseRoute = ref<string>('/api/insights/checklist'); 
  const loadMoreError = ref<APIError | null>(null)
  const viewedRows = ref<Set<string>>(new Set());

  // Cancellation
  let feedController: AbortController | null = null;


  // 1. Initial Load Path
  async function loadInsights(apiPathWithFilters: string): Promise<{ success: boolean; error: APIError | null }> {

    try {
 
      reset()

        // Spawn a fresh controller instance for this specific execution pass
          feedController = new AbortController();

      // Note: Assuming getAsync is part of your API client layer
      const outcome = await getAsync<GetInsightListResponse>(apiPathWithFilters, true, {} as GetInsightListResponse,
        feedController.signal
      );

      // Consideration 1: Check if any error and immediately return to caller
      if (outcome.isFailure) {
        return { success: false, error: outcome.error || null };
      }
      
      // Consideration 2: Reconcile updates if data was retrieved
      if (outcome.isSuccess && outcome.value?.insights?.length) {

        // Commit clean data to store state
        hasNext.value = outcome.value.hasNext;
        pointer.value = outcome.value.pointer;
        anchor.value = outcome.value.anchor;

        insights.value = outcome.value.insights;

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
  async function loadMoreInsights() {

    if (isFetchingMore.value || !hasNext.value) return;

    isFetchingMore.value = true;

    try {

        // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();

        const nextPageUrl = filterStore.buildApiPath(baseRoute.value, pointer.value, anchor.value)

        const outcome = await getAsync<GetInsightListResponse>(nextPageUrl, true, {} as GetInsightListResponse,
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
                    'Unknown error occured while retrieving insight. Refresh page and try again.'
                );
            }

            return
        }

    // Consideration 2: Reconcile updates if data was retrieved
         if (outcome.isSuccess && outcome.value?.insights?.length) {
          // Reconcile updates against incoming block (handles slower message brokers)
          
          // Commit clean data to store state
          hasNext.value = outcome.value.hasNext;
          pointer.value = outcome.value.pointer;
          
          // Filter duplicates already caught by state or top navigation creations
          const existingIds = new HashSetOrSet(insights.value.map(t => t.insightId));
          // 1. Filter out duplicates and immediately shape the raw inputs into valid DTO structures
          const freshItems = outcome.value.insights
            .filter((t: any) => !existingIds.has(t.insightId));

           insights.value.push(...freshItems);
      
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
  async function loadInsight(insightId: string): Promise<{ success: boolean; error: APIError | null }> {
  
    try {
  
      insight.value = null
  
        // Spawn a fresh controller instance for this specific execution pass
          feedController = new AbortController();
  
      // Note: Assuming getAsync is part of your API client layer
      const outcome = await getAsync<InsightDetailDto>(`api/insights/checklist/${insightId}`, true, {} as InsightDetailDto, feedController.signal);
  
      // Consideration 1: Check if any error and immediately return to caller
      if (outcome.isFailure) {
        return { success: false, error: outcome.error || null };
      }
      
      // Inside profileStore.ts fallback block
      if (!outcome.value) {
        
        // 🎯 Instantiate your exact class blueprint with matching parameters
        const error = new APIError(
          404,
          'Not Found!',
          'Sorry. Sorry. We could not find the insight you requested. It may have been removed, hidden, or archived.'
        )
        
            return { success: false, error: error }
      }
  
     insight.value = outcome.value;
  
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

    async function archiveInsight(payload: ConfirmRequest) {
  
      try {
  
        const outcome = await postAsync('/api/insights/admin/archive', payload, true);
  
        if (outcome.isFailure) return { success: false, error: outcome.error };
      
        const index = insights.value.findIndex(t => t.insightId === payload.insightId);
        if (index !== -1) {
          const insight = insights.value[index];
          if (insight) {
            insight.status = 'ArchivedByAdmin';
          }
        }
  
        if(insight.value){
          insight.value.status = 'ArchivedByAdmin';
        }
  
        return { success: true, error: null };
      } catch (err: any) {
        return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
      }
    }
  
    async function hideInsight(payload: ConfirmRequest) {
  
      try {
  
        const outcome = await postAsync('/api/insights/admin/hide', payload, true);
  
        if (outcome.isFailure) return { success: false, error: outcome.error };
      
        const index = insights.value.findIndex(t => t.insightId === payload.insightId);
        if (index !== -1) {
          const insight = insights.value[index];
          if (insight) {
            insight.status = 'HiddenByAdmin';
          }
        }
  
        if(insight.value){
          insight.value.status = 'HiddenByAdmin';
        }
  
        return { success: true, error: null };
      } catch (err: any) {
        return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
      }
    }
  
    async function certifyInsight(payload: ConfirmRequest) {
  
      try {
  
        const outcome = await postAsync('/api/insights/admin/certify', payload, true);
  
        if (outcome.isFailure) return { success: false, error: outcome.error };
      
        const index = insights.value.findIndex(t => t.insightId === payload.insightId);
        if (index !== -1) {
          const insight = insights.value[index];
          if (insight) {
            insight.status = 'CertifiedByAdmin';
          }
        }
  
        if(insight.value){
          insight.value.status = 'CertifiedByAdmin';
        }
  
        return { success: true, error: null };
      } catch (err: any) {
        return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
      }
    }
  
  // 3. Reset State
 function reset() {
    insights.value = [];
    insight.value = null;
    pointer.value = '1';
    hasNext.value = false;
    anchor.value = null;
    isFetchingMore.value = false;
    loadMoreError.value = null;
  }

   // 4. Sets the target insight before a modal opens
  function setBaseRoute(apiUrl: any) {
    // We clone it using spread operator so the insight doesn't alter 
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
    insights, insight, isFetchingMore, loadMoreError,hasNext, pointer, baseRoute, viewedRows,
    setBaseRoute, loadInsights, loadMoreInsights, loadInsight, archiveInsight, hideInsight, certifyInsight, reset, abort
  };

});