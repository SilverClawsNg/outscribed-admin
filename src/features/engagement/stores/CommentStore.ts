import { defineStore } from 'pinia';
import { ref } from 'vue';
import { APIError } from '@/api/apiTypes';
import type {CommentDetailDto, CommentListDto, GetCommentListResponse, ConfirmRequest} from '../types/EngagementTypes'
import { useCommentListFilterStore } from './CommentListFilterStore'
import { getAsync } from '@/api/apiGetServices'
import { postAsync } from '@/api/apiPostServices'

// Native JS Set wrapper implementation shortcut
class HashSetOrSet extends Set<string> {}

export const useCommentStore = defineStore('commentStore', () => {

   // State
  const comments = ref<CommentListDto[]>([]);
  const comment = ref<CommentDetailDto | null>(null);

  //Filter
  const filterStore = useCommentListFilterStore()

   // Loading and Tracking flags matching your C# states
  const isFetchingMore = ref<boolean>(false);
  const hasNext = ref<boolean>(false);
  const pointer = ref<string | number>('1');
  const anchor = ref<string | null>(null);
  const baseRoute = ref<string>('/api/comments/checklist'); 
  const loadMoreError = ref<APIError | null>(null)
  const viewedRows = ref<Set<string>>(new Set());

  // Cancellation
  let feedController: AbortController | null = null;

  // 1. Initial Load Path
  async function loadComments(apiPathWithFilters: string): Promise<{ success: boolean; error: APIError | null}> {

    try {

       reset()

        // Spawn a fresh controller instance for this specific execution pass
          feedController = new AbortController();

      // Note: Assuming getAsync is part of your API client layer
      const outcome = await getAsync<GetCommentListResponse>(apiPathWithFilters, true, {} as GetCommentListResponse,
        feedController.signal
      );

      // Consideration 1: Check if any error and immediately return to caller
      if (outcome.isFailure) {
        return { success: false, error: outcome.error || null};
      }
      
      // Consideration 2: Reconcile updates if data was retrieved
      if (outcome.isSuccess && outcome.value?.comments?.length) {

        // Commit clean data to store state
        hasNext.value = outcome.value.hasNext;
        pointer.value = outcome.value.pointer;
        anchor.value = outcome.value.anchor;

        comments.value = outcome.value.comments;

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
  async function loadMoreComments() {

    if (isFetchingMore.value || !hasNext.value) return;

    isFetchingMore.value = true;

    try {

        // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();

        const nextPageUrl = filterStore.buildApiPath(baseRoute.value, pointer.value, anchor.value)

        const outcome = await getAsync<GetCommentListResponse>(nextPageUrl, true, {} as GetCommentListResponse,
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
                    'Unknown error occured while retrieving comment. Refresh page and try again.'
                );
            }

            return
        }

    // Consideration 2: Reconcile updates if data was retrieved
         if (outcome.isSuccess && outcome.value?.comments?.length) {
          // Reconcile updates against incoming block (handles slower message brokers)
          
          // Commit clean data to store state
          hasNext.value = outcome.value.hasNext;
          pointer.value = outcome.value.pointer;
          
          // Filter duplicates already caught by state or top navigation creations
          const existingIds = new HashSetOrSet(comments.value.map(t => t.commentId));
          // 1. Filter out duplicates and immediately shape the raw inputs into valid DTO structures
          const freshItems = outcome.value.comments
            .filter((t: any) => !existingIds.has(t.commentId));

           comments.value.push(...freshItems);
      
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
  async function loadComment(commentId: string): Promise<{ success: boolean; error: APIError | null;  
    comment: CommentDetailDto | null }> {
  
    try {
  
      comment.value = null
  
        // Spawn a fresh controller instance for this specific execution pass
          feedController = new AbortController();
  
      // Note: Assuming getAsync is part of your API client layer
      const outcome = await getAsync<CommentDetailDto>(`api/comments/checklist/${commentId}`, true, {} as CommentDetailDto, feedController.signal);
  
      // Consideration 1: Check if any error and immediately return to caller
      if (outcome.isFailure) {
        return { success: false, error: outcome.error || null, comment: null };
      }
      
      // Inside profileStore.ts fallback block
      if (!outcome.value) {
        
        // 🎯 Instantiate your exact class blueprint with matching parameters
        const error = new APIError(
          404,
          'Not Found!',
          'Sorry. Sorry. We could not find the comment you requested. It may have been removed, hidden, or archived.'
        )
        
            return { success: false, error: error, comment: null }
      }
  
      comment.value = outcome.value;
  
      // Success! The caller handles toggling its loading state and grabbing data from the store reactively.
      return { success: true, error: null, comment: comment.value };
  
    } catch (err: any) {
      // Fail-safe catch-all wrapper
      return { 
        success: false, 
        error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.'),
        comment: null

      };
    }
  }

    async function archiveComment(payload: ConfirmRequest) {
  
      try {
  
        const outcome = await postAsync('/api/commenting/archive', payload, true);
  
        if (outcome.isFailure) return { success: false, error: outcome.error };
      
        const index = comments.value.findIndex(t => t.commentId === payload.commentId);
        if (index !== -1) {
          const comment = comments.value[index];
          if (comment) {
            comment.status = 'ArchivedByAdmin';
          }
        }
  
        if(comment.value){
          comment.value.status = 'ArchivedByAdmin';
        }
  
        return { success: true, error: null };
      } catch (err: any) {
        return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
      }
    }
  
    async function hideComment(payload: ConfirmRequest) {
  
      try {
  
        const outcome = await postAsync('/api/commenting/hide', payload, true);
  
        if (outcome.isFailure) return { success: false, error: outcome.error };
      
        const index = comments.value.findIndex(t => t.commentId === payload.commentId);
        if (index !== -1) {
          const comment = comments.value[index];
          if (comment) {
            comment.status = 'HiddenByAdmin';
          }
        }
  
        if(comment.value){
          comment.value.status = 'HiddenByAdmin';
        }
  
        return { success: true, error: null };
      } catch (err: any) {
        return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
      }
    }
  
    async function certifyComment(payload: ConfirmRequest) {
  
      try {
  
        const outcome = await postAsync('/api/commenting/certify', payload, true);
  
        if (outcome.isFailure) return { success: false, error: outcome.error };
      
        const index = comments.value.findIndex(t => t.commentId === payload.commentId);
        if (index !== -1) {
          const comment = comments.value[index];
          if (comment) {
            comment.status = 'CertifiedByAdmin';
          }
        }
  
        if(comment.value){
          comment.value.status = 'CertifiedByAdmin';
        }
  
        return { success: true, error: null };
      } catch (err: any) {
        return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
      }
    }
  

  // 3. Reset State
 function reset() {
    comments.value = [];
    comment.value = null;
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
    comments, comment, isFetchingMore, loadMoreError,hasNext, pointer, baseRoute, viewedRows,
    setBaseRoute, loadComments, loadMoreComments, loadComment, archiveComment, hideComment, certifyComment, reset, abort
  };

});