import { defineStore } from 'pinia';
import { ref } from 'vue';
import { APIError } from '@/api/apiTypes';
import type {TaleListDto, GetTaleListResponse, TaleDetailDto, ConfirmRequest} from '../types/TaleTypes'
import { useTaleListFilterStore } from './TaleListFilterStore'
import { getAsync } from '@/api/apiGetServices'
import { postAsync } from '@/api/apiPostServices'

// Native JS Set wrapper implementation shortcut
class HashSetOrSet extends Set<string> {}

export const useTaleStore = defineStore('taleStore', () => {

   // State
  const tales = ref<TaleListDto[]>([]);
  const tale = ref<TaleDetailDto | null>(null);

  //Filter
  const filterStore = useTaleListFilterStore()

   // Loading and Tracking flags matching your C# states
  const isFetchingMore = ref<boolean>(false);
  const hasNext = ref<boolean>(false);
  const pointer = ref<string | number>('1');
  const anchor = ref<string | null>(null);
  const baseRoute = ref<string>('/api/tales/checklist'); 
  const loadMoreError = ref<APIError | null>(null)
  const viewedRows = ref<Set<string>>(new Set());

  // Cancellation
  let feedController: AbortController | null = null;


  // 1. Initial Load Path
  async function loadTales(apiPathWithFilters: string): Promise<{ success: boolean; error: APIError | null }> {

    try {

       reset()

        // Spawn a fresh controller instance for this specific execution pass
          feedController = new AbortController();

      // Note: Assuming getAsync is part of your API client layer
      const outcome = await getAsync<GetTaleListResponse>(apiPathWithFilters, true, {} as GetTaleListResponse,
        feedController.signal
      );

      // Consideration 1: Check if any error and immediately return to caller
      if (outcome.isFailure) {
        return { success: false, error: outcome.error || null };
      }
      
      // Consideration 2: Reconcile updates if data was retrieved
      if (outcome.isSuccess && outcome.value?.tales?.length) {

        // Commit clean data to store state
        hasNext.value = outcome.value.hasNext;
        pointer.value = outcome.value.pointer;
        anchor.value = outcome.value.anchor;

        tales.value = outcome.value.tales;

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
  async function loadMoreTales() {

    if (isFetchingMore.value || !hasNext.value) return;

    isFetchingMore.value = true;

    try {

        // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();

        const nextPageUrl = filterStore.buildApiPath(baseRoute.value, pointer.value, anchor.value)

        const outcome = await getAsync<GetTaleListResponse>(nextPageUrl, true, {} as GetTaleListResponse,
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
                    'Unknown error occured while retrieving tale. Refresh page and try again.'
                );
            }

            return
        }

    // Consideration 2: Reconcile updates if data was retrieved
         if (outcome.isSuccess && outcome.value?.tales?.length) {
          // Reconcile updates against incoming block (handles slower message brokers)
          
          // Commit clean data to store state
          hasNext.value = outcome.value.hasNext;
          pointer.value = outcome.value.pointer;
          
          // Filter duplicates already caught by state or top navigation creations
          const existingIds = new HashSetOrSet(tales.value.map(t => t.taleId));
          // 1. Filter out duplicates and immediately shape the raw inputs into valid DTO structures
          const freshItems = outcome.value.tales
            .filter((t: any) => !existingIds.has(t.taleId));

           tales.value.push(...freshItems);
      
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
async function loadTale(taleId: string): Promise<{ success: boolean; error: APIError | null }> {

  try {

    tale.value = null

      // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();

    // Note: Assuming getAsync is part of your API client layer
    const outcome = await getAsync<TaleDetailDto>(`api/tales/checklist/${taleId}`, true, {} as TaleDetailDto, feedController.signal);

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
        'Sorry. Sorry. We could not find the tale you requested. It may have been removed, hidden, or archived.'
      )
      
          return { success: false, error: error }
    }

  tale.value = outcome.value;

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

    async function archiveTale(payload: ConfirmRequest) {
  
      try {
  
        const outcome = await postAsync('/api/tales/admin/archive', payload, true);
  
        if (outcome.isFailure) return { success: false, error: outcome.error };
      
        const index = tales.value.findIndex(t => t.taleId === payload.taleId);
        if (index !== -1) {
          const tale = tales.value[index];
          if (tale) {
            tale.status = 'ArchivedByAdmin';
          }
        }
  
        if(tale.value){
          tale.value.status = 'ArchivedByAdmin';
        }
  
        return { success: true, error: null };
      } catch (err: any) {
        return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
      }
    }
  
    async function hideTale(payload: ConfirmRequest) {
  
      try {
  
        const outcome = await postAsync('/api/tales/admin/hide', payload, true);
  
        if (outcome.isFailure) return { success: false, error: outcome.error };
      
        const index = tales.value.findIndex(t => t.taleId === payload.taleId);
        if (index !== -1) {
          const tale = tales.value[index];
          if (tale) {
            tale.status = 'HiddenByAdmin';
          }
        }
  
        if(tale.value){
          tale.value.status = 'HiddenByAdmin';
        }
  
        return { success: true, error: null };
      } catch (err: any) {
        return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
      }
    }
  
    async function certifyTale(payload: ConfirmRequest) {
  
      try {
  
        const outcome = await postAsync('/api/tales/admin/certify', payload, true);
  
        if (outcome.isFailure) return { success: false, error: outcome.error };
      
        const index = tales.value.findIndex(t => t.taleId === payload.taleId);
        if (index !== -1) {
          const tale = tales.value[index];
          if (tale) {
            tale.status = 'CertifiedByAdmin';
          }
        }
  
        if(tale.value){
          tale.value.status = 'CertifiedByAdmin';
        }
  
        return { success: true, error: null };
      } catch (err: any) {
        return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
      }
    }
  
  // 3. Reset State
 function reset() {
    tales.value = [];
    tale.value = null;
    pointer.value = '1';
    hasNext.value = false;
    anchor.value = null;
    isFetchingMore.value = false;
    loadMoreError.value = null;
  }

   // 4. Sets the target tale before a modal opens
  function setBaseRoute(apiUrl: any) {
    // We clone it using spread operator so the tale doesn't alter 
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
    tales, tale, isFetchingMore, loadMoreError,hasNext, pointer, baseRoute, viewedRows,
    setBaseRoute, loadTales, loadMoreTales, loadTale, reset, archiveTale, hideTale, certifyTale, abort
  };

});