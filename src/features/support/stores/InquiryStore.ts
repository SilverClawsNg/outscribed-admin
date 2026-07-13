import { defineStore } from 'pinia';
import { ref } from 'vue';
import { APIError } from '@/api/apiTypes';
import type {InquiryListDto, GetInquiryListResponse, AnswerInquiryRequest, InquiryDetailDto} from '../types/SupportTypes'
import { useInquiryListFilterStore } from './InquiryListFilterStore'
import { getAsync } from '@/api/apiGetServices'
import { postAsync } from '@/api/apiPostServices';
import { type InquiryStatus } from '@/utils/enumHelper';


// Native JS Set wrapper implementation shortcut
class HashSetOrSet extends Set<string> {}

export const useInquiryStore = defineStore('inquiryStore', () => {

   // State
  const inquiries = ref<InquiryListDto[]>([]);
  const inquiry = ref<InquiryDetailDto | null>(null);

  //Filter
  const filterStore = useInquiryListFilterStore()

   // Loading and Tracking flags matching your C# states
  const isFetchingMore = ref<boolean>(false);
  const hasNext = ref<boolean>(false);
  const pointer = ref<string | number>('1');
  const anchor = ref<string | null>(null);
  const baseRoute = ref<string>('/api/inquiries/checklist'); 
  const loadMoreError = ref<APIError | null>(null)
  const viewedRows = ref<Set<string>>(new Set());

  // Cancellation
  let feedController: AbortController | null = null;


  // 1. Initial Load Path
  async function loadInquiries(apiPathWithFilters: string): Promise<{ success: boolean; error: APIError | null }> {

    try {

      reset()

        // Spawn a fresh controller instance for this specific execution pass
          feedController = new AbortController();

      // Note: Assuming getAsync is part of your API client layer
      const outcome = await getAsync<GetInquiryListResponse>(apiPathWithFilters, true, {} as GetInquiryListResponse,
        feedController.signal
      );

      // Consideration 1: Check if any error and immediately return to caller
      if (outcome.isFailure) {
        return { success: false, error: outcome.error || null };
      }
      
      // Consideration 2: Reconcile updates if data was retrieved
      if (outcome.isSuccess && outcome.value?.inquiries?.length) {

        // Commit clean data to store state
        hasNext.value = outcome.value.hasNext;
        pointer.value = outcome.value.pointer;
        anchor.value = outcome.value.anchor;

        inquiries.value = outcome.value.inquiries;

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
  async function loadMoreInquiries() {

    if (isFetchingMore.value || !hasNext.value) return;

    isFetchingMore.value = true;

    try {

        // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();

        const nextPageUrl = filterStore.buildApiPath(baseRoute.value, pointer.value, anchor.value)

        const outcome = await getAsync<GetInquiryListResponse>(nextPageUrl, true, {} as GetInquiryListResponse,
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
                    'Unknown error occured while retrieving inquiry. Refresh page and try again.'
                );
            }

            return
        }

    // Consideration 2: Reconcile updates if data was retrieved
         if (outcome.isSuccess && outcome.value?.inquiries?.length) {
          // Reconcile updates against incoming block (handles slower message brokers)
          
          // Commit clean data to store state
          hasNext.value = outcome.value.hasNext;
          pointer.value = outcome.value.pointer;
          
          // Filter duplicates already caught by state or top navigation creations
          const existingIds = new HashSetOrSet(inquiries.value.map(t => t.inquiryId));
          // 1. Filter out duplicates and immediately shape the raw inputs into valid DTO structures
          const freshItems = outcome.value.inquiries
            .filter((t: any) => !existingIds.has(t.inquiryId));

           inquiries.value.push(...freshItems);
      
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
    async function loadInquiry(inquiryId: string): Promise<{ success: boolean; error: APIError | null }> {
    
      try {
    
        inquiry.value = null
    
          // Spawn a fresh controller instance for this specific execution pass
            feedController = new AbortController();
    
        // Note: Assuming getAsync is part of your API client layer
        const outcome = await getAsync<InquiryDetailDto>(`api/inquiries/checklist/${inquiryId}`, true, {} as InquiryDetailDto, feedController.signal);
    
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
            'Sorry. Sorry. We could not find the inquiry you requested. It may have been removed, hidden, or archived.'
          )
          
              return { success: false, error: error }
        }
    
       inquiry.value = outcome.value;
    
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
  

    async function answerInquiry(payload: AnswerInquiryRequest) {
        
            try {
        
              const outcome = await postAsync('/api/inquiries/answer', payload, true);
        
              if (outcome.isFailure) return { success: false, error: outcome.error };
  
               //Update user within collection
            const index = inquiries.value.findIndex(t => t.inquiryId === payload.inquiryId);
            if (index !== -1) {
              const inquiry = inquiries.value[index];
              if (inquiry) {
                inquiry.status = 'Resolved';
              }
            }
  
            if(inquiry.value){
             inquiry.value.status = 'Resolved';
            }
            
              return { success: true, error: null };
            } catch (err: any) {
              return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
            }
  }


  // 3. Reset State
 function reset() {
    inquiries.value = [];
    inquiry.value = null;
    pointer.value = '1';
    hasNext.value = false;
    anchor.value = null;
    isFetchingMore.value = false;
    loadMoreError.value = null;
  }

   // 4. Sets the target tale before a modal opens
  function setBaseRoute(apiUrl: any) {
    // We clone it using spread operator so the inquiry doesn't alter 
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
    inquiries, inquiry, isFetchingMore, loadMoreError,hasNext, pointer, baseRoute, viewedRows,
    setBaseRoute, loadInquiries, loadMoreInquiries, loadInquiry, answerInquiry, reset, abort
  };

});