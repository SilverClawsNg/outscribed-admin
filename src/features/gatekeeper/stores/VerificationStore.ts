import { defineStore } from 'pinia';
import { ref } from 'vue';
import { APIError } from '@/api/apiTypes';
import type {VerificationDetailDto, VerificationListDto, GetVerificationListResponse} from '../types/GatekeeperTypes'
import { useVerificationListFilterStore } from './VerificationListFilterStore'
import { getAsync } from '@/api/apiGetServices'

class HashSetOrSet extends Set<string> {}

export const useVerificationStore = defineStore('verificationsStore', () => {

   // State
  const verifications = ref<VerificationListDto[]>([]);
  const verification = ref<VerificationDetailDto | null>(null);

  //Filter
  const filterStore = useVerificationListFilterStore()

   // Loading and Tracking flags matching your C# states
  const isFetchingMore = ref<boolean>(false);
  const hasNext = ref<boolean>(false);
  const pointer = ref<string | number>('1');
  const anchor = ref<string | null>(null);
  const baseRoute = ref<string>('/api/verifications/checklist'); 
  const loadMoreError = ref<APIError | null>(null)
  const viewedRows = ref<Set<string>>(new Set());

  // Cancellation
  let feedController: AbortController | null = null;

  // 1. Initial Load Path
  async function loadVerifications(apiPathWithFilters: string): Promise<{ success: boolean; error: APIError | null }> {

    reset()

    try {

        // Spawn a fresh controller instance for this specific execution pass
          feedController = new AbortController();

      // Note: Assuming getAsync is part of your API client layer
      const outcome = await getAsync<GetVerificationListResponse>(apiPathWithFilters, true, {} as GetVerificationListResponse,
        feedController.signal
      );

      // Consideration 1: Check if any error and immediately return to caller
      if (outcome.isFailure) {
        return { success: false, error: outcome.error || null };
      }
      
      // Consideration 2: Reconcile updates if data was retrieved
      if (outcome.isSuccess && outcome.value?.verifications?.length) {

        // Commit clean data to store state
        hasNext.value = outcome.value.hasNext;
        pointer.value = outcome.value.pointer;
        anchor.value = outcome.value.anchor;

        verifications.value = outcome.value.verifications;

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
  async function loadMoreVerifications() {

    if (isFetchingMore.value || !hasNext.value) return;

    isFetchingMore.value = true;

    try {

        // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();

        const nextPageUrl = filterStore.buildApiPath(baseRoute.value, pointer.value, anchor.value)

        const outcome = await getAsync<GetVerificationListResponse>(nextPageUrl, true, {} as GetVerificationListResponse,
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
                    'Unknown error occured while retrieving verifications. Refresh page and try again.'
                );
            }

            return
        }

    // Consideration 2: Reconcile updates if data was retrieved
         if (outcome.isSuccess && outcome.value?.verifications?.length) {
          // Reconcile updates against incoming block (handles slower message brokers)
          
          // Commit clean data to store state
          hasNext.value = outcome.value.hasNext;
          pointer.value = outcome.value.pointer;
          
          // Filter duplicates already caught by state or top navigation creations
          const existingIds = new HashSetOrSet(verifications.value.map(t => t.verificationId));
          // 1. Filter out duplicates and immediately shape the raw inputs into valid DTO structures
          const freshItems = outcome.value.verifications
            .filter((t: any) => !existingIds.has(t.verificationId));

           verifications.value.push(...freshItems);
      
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
    async function loadVerification(verificationId: string): Promise<{ success: boolean; error: APIError | null }> {
    
      try {
    
        verification.value = null
    
          // Spawn a fresh controller instance for this specific execution pass
            feedController = new AbortController();
    
        // Note: Assuming getAsync is part of your API client layer
        const outcome = await getAsync<VerificationDetailDto>(`api/verifications/checklist/${verificationId}`, true, {} as VerificationDetailDto, feedController.signal);
    
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
            'We could not find the verification you requested. It may have been removed, hidden, or archived.'
          )
          
              return { success: false, error: error }
        }
    
       verification.value = outcome.value;
    
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
    verifications.value = [];
    verification.value = null;
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
    verifications, verification, isFetchingMore, loadMoreError,hasNext, pointer, baseRoute, viewedRows,
    setBaseRoute, loadVerifications, loadMoreVerifications, loadVerification, reset, abort
  };

});