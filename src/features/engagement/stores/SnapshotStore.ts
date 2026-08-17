import { defineStore } from 'pinia';
import { ref } from 'vue';
import { APIError } from '@/api/apiTypes';
import type {SnapshotDetailDto, SnapshotListDto, GetSnapshotListResponse} from '../types/EngagementTypes'
import { useSnapshotListFilterStore } from './SnapshotListFilterStore'
import { getAsync } from '@/api/apiGetServices'

// Native JS Set wrapper implementation shortcut
class HashSetOrSet extends Set<string> {}

export const useSnapshotStore = defineStore('snapshotStore', () => {

   // State
  const snapshots = ref<SnapshotListDto[]>([]);
  const snapshot = ref<SnapshotDetailDto | null>(null);

  //Filter
  const filterStore = useSnapshotListFilterStore()

   // Loading and Tracking flags matching your C# states
  const isFetchingMore = ref<boolean>(false);
  const hasNext = ref<boolean>(false);
  const pointer = ref<string | number>('1');
  const anchor = ref<string | null>(null);
  const baseRoute = ref<string>('/api/snapshots/checklist'); 
  const loadMoreError = ref<APIError | null>(null)
  const viewedRows = ref<Set<string>>(new Set());

  // Cancellation
  let feedController: AbortController | null = null;

  // 1. Initial Load Path
  async function loadSnapshots(apiPathWithFilters: string): Promise<{ success: boolean; error: APIError | null }> {

    try {

       reset()

        // Spawn a fresh controller instance for this specific execution pass
          feedController = new AbortController();

      // Note: Assuming getAsync is part of your API client layer
      const outcome = await getAsync<GetSnapshotListResponse>(apiPathWithFilters, true, {} as GetSnapshotListResponse,
        feedController.signal
      );

      // Consideration 1: Check if any error and immediately return to caller
      if (outcome.isFailure) {
        return { success: false, error: outcome.error || null };
      }
      
      // Consideration 2: Reconcile updates if data was retrieved
      if (outcome.isSuccess && outcome.value?.snapshots?.length) {

        // Commit clean data to store state
        hasNext.value = outcome.value.hasNext;
        pointer.value = outcome.value.pointer;
        anchor.value = outcome.value.anchor;

        snapshots.value = outcome.value.snapshots;

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
  async function loadMoreSnapshots() {

    if (isFetchingMore.value || !hasNext.value) return;

    isFetchingMore.value = true;

    try {

        // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();

        const nextPageUrl = filterStore.buildApiPath(baseRoute.value, pointer.value, anchor.value)

        const outcome = await getAsync<GetSnapshotListResponse>(nextPageUrl, true, {} as GetSnapshotListResponse,
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
                    'Unknown error occured while retrieving snapshot. Refresh page and try again.'
                );
            }

            return
        }

    // Consideration 2: Reconcile updates if data was retrieved
         if (outcome.isSuccess && outcome.value?.snapshots?.length) {
          // Reconcile updates against incoming block (handles slower message brokers)
          
          // Commit clean data to store state
          hasNext.value = outcome.value.hasNext;
          pointer.value = outcome.value.pointer;
          
          // Filter duplicates already caught by state or top navigation creations
          const existingIds = new HashSetOrSet(snapshots.value.map(t => t.id));
          // 1. Filter out duplicates and immediately shape the raw inputs into valid DTO structures
          const freshItems = outcome.value.snapshots
            .filter((t: any) => !existingIds.has(t.id));

           snapshots.value.push(...freshItems);
      
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
  async function loadSnapshot(id: string): Promise<{ success: boolean; error: APIError | null }> {
  
    try {
  
      snapshot.value = null
  
        // Spawn a fresh controller instance for this specific execution pass
          feedController = new AbortController();
  
      // Note: Assuming getAsync is part of your API client layer
      const outcome = await getAsync<SnapshotDetailDto>(`api/snapshots/checklist/${id}`, true, {} as SnapshotDetailDto, feedController.signal);
  
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
          'Sorry. Sorry. We could not find the snapshot you requested. It may have been removed, hidden, or archived.'
        )
        
            return { success: false, error: error }
      }
  
     snapshot.value = outcome.value;
  
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
    snapshots.value = [];
    snapshot.value = null;
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
    snapshots, snapshot, isFetchingMore, loadMoreError,hasNext, pointer, baseRoute, viewedRows,
    setBaseRoute, loadSnapshots, loadMoreSnapshots, loadSnapshot, reset, abort
  };

});