import { defineStore } from 'pinia';
import { ref } from 'vue';
import { APIError } from '@/api/apiTypes';
import type {FaqListDto, GetFaqListResponse, FaqDetailDto, CreateFaqRequest, CreateFaqResponse, UpdateFaqRequest} from '../types/SupportTypes'
import { useFaqListFilterStore } from './FaqListFilterStore'
import { getAsync } from '@/api/apiGetServices'
import { postAsync } from '@/api/apiPostServices';

// Native JS Set wrapper implementation shortcut
class HashSetOrSet extends Set<string> {}

export const useFaqStore = defineStore('faqStore', () => {

   // State
  const faqs = ref<FaqListDto[]>([]);
  const faq = ref<FaqDetailDto | null>(null);

  //Filter
  const filterStore = useFaqListFilterStore()

   // Loading and Tracking flags matching your C# states
  const isFetchingMore = ref<boolean>(false);
  const hasNext = ref<boolean>(false);
  const pointer = ref<string | number>('1');
  const anchor = ref<string | null>(null);
  const baseRoute = ref<string>('/api/faqs/checklist'); 
  const loadMoreError = ref<APIError | null>(null)
  const viewedRows = ref<Set<string>>(new Set());

  // Cancellation
  let feedController: AbortController | null = null;


  // 1. Initial Load Path
  async function loadFaqs(apiPathWithFilters: string): Promise<{ success: boolean; error: APIError | null }> {

    try {

      reset()
      
        // Spawn a fresh controller instance for this specific execution pass
          feedController = new AbortController();

      // Note: Assuming getAsync is part of your API client layer
      const outcome = await getAsync<GetFaqListResponse>(apiPathWithFilters, true, {} as GetFaqListResponse,
        feedController.signal
      );

      // Consideration 1: Check if any error and immediately return to caller
      if (outcome.isFailure) {
        return { success: false, error: outcome.error || null };
      }
      
      // Consideration 2: Reconcile updates if data was retrieved
      if (outcome.isSuccess && outcome.value?.faqs?.length) {

        // Commit clean data to store state
        hasNext.value = outcome.value.hasNext;
        pointer.value = outcome.value.pointer;
        anchor.value = outcome.value.anchor;

        faqs.value = outcome.value.faqs;

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
  async function loadMoreFaqs() {

    if (isFetchingMore.value || !hasNext.value) return;

    isFetchingMore.value = true;

    try {

        // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();

        const nextPageUrl = filterStore.buildApiPath(baseRoute.value, pointer.value, anchor.value)

        const outcome = await getAsync<GetFaqListResponse>(nextPageUrl, true, {} as GetFaqListResponse,
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
                    'Unknown error occured while retrieving faq. Refresh page and try again.'
                );
            }

            return
        }

    // Consideration 2: Reconcile updates if data was retrieved
         if (outcome.isSuccess && outcome.value?.faqs?.length) {
          // Reconcile updates against incoming block (handles slower message brokers)
          
          // Commit clean data to store state
          hasNext.value = outcome.value.hasNext;
          pointer.value = outcome.value.pointer;
          
          // Filter duplicates already caught by state or top navigation creations
          const existingIds = new HashSetOrSet(faqs.value.map(t => t.faqId));
          // 1. Filter out duplicates and immediately shape the raw inputs into valid DTO structures
          const freshItems = outcome.value.faqs
            .filter((t: any) => !existingIds.has(t.faqId));

           faqs.value.push(...freshItems);
      
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
  async function loadFaq(faqId: string): Promise<{ success: boolean; error: APIError | null }> {
  
    try {
  
      faq.value = null
  
        // Spawn a fresh controller instance for this specific execution pass
          feedController = new AbortController();
  
      // Note: Assuming getAsync is part of your API client layer
      const outcome = await getAsync<FaqDetailDto>(`api/faqs/checklist/${faqId}`, true, {} as FaqDetailDto, feedController.signal);
  
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
          'Sorry. Sorry. We could not find the faq you requested. It may have been removed, hidden, or archived.'
        )
        
            return { success: false, error: error }
      }
  
     faq.value = outcome.value;

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

  
  // Unified creation logic matching CreateInsightModal.vue expectation
  async function createFaq(payload: CreateFaqRequest) {

    if(payload.category == '-1') return { success: false, error: null };
    
    try {
      const outcome = await postAsync<CreateFaqResponse>('/api/faqs/create', payload, true);
      
      if (outcome.isFailure) {
        return { success: false, error: outcome.error };
      }

      if (!outcome.value) {
        const error = new APIError(
          500,
          'Blank Response',
          'Request may have succeeded but server response blank. Refresh page before retrying'
        );
        return { success: false, error: error };
      } 

      const newFaq: FaqListDto = {
        faqId: outcome.value.id,
        lastUpdatedAt: new Date().toISOString(),
        question: payload.question,
        category: payload.category,
      };
      
      faqs.value.unshift(newFaq);

      return { success: true, error: null };
    } catch (err: any) {
      return { 
        success: false, 
        error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') 
      };
    }
  }

        async function updateFaq(payload: UpdateFaqRequest) {
      
          try {
      
            const outcome = await postAsync('/api/faqs/update', payload, true);
      
            if (outcome.isFailure) return { success: false, error: outcome.error };

            if(outcome.value){
  
          //Update user within collection
          const index = faqs.value.findIndex(t => t.faqId === payload.faqId);
          if (index !== -1) {
            const faq = faqs.value[index];
            if (faq) {
              faq.question = payload.question;
             if(payload.category != '-1')  faq.category = payload.category;
            }
          }

          if(faq.value){
            faq.value.question = payload.question;
             if(payload.category != '-1')  faq.value.category = payload.category;
  
          }

            }
          
            return { success: true, error: null };
          } catch (err: any) {
            return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
          }
        }

  // 3. Reset State
 function reset() {
    faqs.value = [];
    faq.value = null;
    pointer.value = '1';
    hasNext.value = false;
    anchor.value = null;
    isFetchingMore.value = false;
    loadMoreError.value = null;
  }

   // 4. Sets the target tale before a modal opens
  function setBaseRoute(apiUrl: any) {
    // We clone it using spread operator so the faq doesn't alter 
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
    faqs, faq, isFetchingMore, loadMoreError,hasNext, pointer, baseRoute, viewedRows,
    setBaseRoute, loadFaqs, loadFaq, loadMoreFaqs, createFaq, updateFaq, reset, abort
  };

});