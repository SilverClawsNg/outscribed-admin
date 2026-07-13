import { defineStore } from 'pinia';
import { ref } from 'vue';
import { APIError } from '@/api/apiTypes';
import type {WriterListDto, GetWriterListResponse, WriterDetailDto, ConfirmRequest} from '../types/AuthoringTypes'
import { useWriterListFilterStore } from './WriterListFilterStore'
import { getAsync } from '@/api/apiGetServices'
import { postAsync } from '@/api/apiPostServices'

// Native JS Set wrapper implementation shortcut
class HashSetOrSet extends Set<string> {}

export const useWriterStore = defineStore('writerStore', () => {

   // State
  const writers = ref<WriterListDto[]>([]);
  const writer = ref<WriterDetailDto | null>(null);

  //Filter
  const filterStore = useWriterListFilterStore()

   // Loading and Tracking flags matching your C# states
  const isFetchingMore = ref<boolean>(false);
  const hasNext = ref<boolean>(false);
  const pointer = ref<string | number>('1');
  const anchor = ref<string | null>(null);
  const baseRoute = ref<string>('/api/writers/checklist'); 
  const loadMoreError = ref<APIError | null>(null)
  const viewedRows = ref<Set<string>>(new Set());

  // Cancellation
  let feedController: AbortController | null = null;


  // 1. Initial Load Path
  async function loadWriters(apiPathWithFilters: string): Promise<{ success: boolean; error: APIError | null }> {

    reset()

    try {

        // Spawn a fresh controller instance for this specific execution pass
          feedController = new AbortController();

      // Note: Assuming getAsync is part of your API client layer
      const outcome = await getAsync<GetWriterListResponse>(apiPathWithFilters, true, {} as GetWriterListResponse,
        feedController.signal
      );

      // Consideration 1: Check if any error and immediately return to caller
      if (outcome.isFailure) {
        return { success: false, error: outcome.error || null };
      }
      
      // Consideration 2: Reconcile updates if data was retrieved
      if (outcome.isSuccess && outcome.value?.writers?.length) {

        // Commit clean data to store state
        hasNext.value = outcome.value.hasNext;
        pointer.value = outcome.value.pointer;
        anchor.value = outcome.value.anchor;

        writers.value = outcome.value.writers;

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
  async function loadMoreWriters() {

    if (isFetchingMore.value || !hasNext.value) return;

    isFetchingMore.value = true;

    try {

        // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();

        const nextPageUrl = filterStore.buildApiPath(baseRoute.value, pointer.value, anchor.value)

        const outcome = await getAsync<GetWriterListResponse>(nextPageUrl, true, {} as GetWriterListResponse,
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
                    'Unknown error occured while retrieving writer. Refresh page and try again.'
                );
            }

            return
        }

    // Consideration 2: Reconcile updates if data was retrieved
         if (outcome.isSuccess && outcome.value?.writers?.length) {
          // Reconcile updates against incoming block (handles slower message brokers)
          
          // Commit clean data to store state
          hasNext.value = outcome.value.hasNext;
          pointer.value = outcome.value.pointer;
          
          // Filter duplicates already caught by state or top navigation creations
          const existingIds = new HashSetOrSet(writers.value.map(t => t.writerId));
          // 1. Filter out duplicates and immediately shape the raw inputs into valid DTO structures
          const freshItems = outcome.value.writers
            .filter((t: any) => !existingIds.has(t.writerId));

           writers.value.push(...freshItems);
      
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
  async function loadWriter(writerId: string): Promise<{ success: boolean; error: APIError | null }> {
  
    try {
  
      writer.value = null
  
        // Spawn a fresh controller instance for this specific execution pass
          feedController = new AbortController();
  
      // Note: Assuming getAsync is part of your API client layer
      const outcome = await getAsync<WriterDetailDto>(`api/writers/checklist/${writerId}`, true, {} as WriterDetailDto, feedController.signal);
  
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
          'Sorry. Sorry. We could not find the writer you requested. It may have been removed, hidden, or archived.',
          'Writer.WriterNotFound'
        )
        
            return { success: false, error: error }
      }
  
    writer.value = outcome.value;
  
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

  async function suspendWriter(payload: ConfirmRequest) {

    try {

      const outcome = await postAsync('/api/authoring/suspend', payload, true);

      if (outcome.isFailure) return { success: false, error: outcome.error };
    
      const index = writers.value.findIndex(t => t.writerId === payload.writerId);
      if (index !== -1) {
        const writer = writers.value[index];
        if (writer) {
          writer.status = 'Suspended';
        }
      }

      if(writer.value){
        writer.value.status = 'Suspended';
      }

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  async function reinstateWriter(payload: ConfirmRequest) {

    try {

      const outcome = await postAsync('/api/authoring/reinstate', payload, true);

      if (outcome.isFailure) return { success: false, error: outcome.error };
    
      const index = writers.value.findIndex(t => t.writerId === payload.writerId);
      if (index !== -1) {
        const writer = writers.value[index];
        if (writer) {
          writer.status = 'Active';
        }
      }

      if(writer.value){
        writer.value.status = 'Active';
      }

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }


  // 3. Reset State
 function reset() {
    writers.value = [];
    writer.value = null;
    pointer.value = '1';
    hasNext.value = false;
    anchor.value = null;
    isFetchingMore.value = false;
    loadMoreError.value = null;
  }

   // 4. Sets the target tale before a modal opens
  function setBaseRoute(apiUrl: any) {
    // We clone it using spread operator so the writer doesn't alter 
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
    writers, writer, isFetchingMore, loadMoreError,hasNext, pointer, baseRoute, viewedRows,
    setBaseRoute, loadWriters, loadMoreWriters, loadWriter, suspendWriter, reinstateWriter, reset, abort
  };

});