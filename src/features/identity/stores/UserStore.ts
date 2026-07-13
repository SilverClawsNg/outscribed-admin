import { defineStore } from 'pinia';
import { ref } from 'vue';
import { APIError } from '@/api/apiTypes';
import type {UserListDto, GetUserListResponse, UserDetailDto, AssignRoleRequest, 
  ConfirmRequest} from '../types/IdentityTypes'
import { useUserListFilterStore } from './UserListFilterStore'
import { getAsync } from '@/api/apiGetServices'
import { postAsync } from '@/api/apiPostServices'

// Native JS Set wrapper implementation shortcut
class HashSetOrSet extends Set<string> {}

export const useUserStore = defineStore('userStore', () => {

   // State
  const users = ref<UserListDto[]>([]);
  const user = ref<UserDetailDto | null>(null);

  //Filter
  const filterStore = useUserListFilterStore()

   // Loading and Tracking flags matching your C# states
  const isFetchingMore = ref<boolean>(false);
  const hasNext = ref<boolean>(false);
  const pointer = ref<string | number>('1');
  const anchor = ref<string | null>(null);
  const baseRoute = ref<string>('/api/users/checklist'); 
  const loadMoreError = ref<APIError | null>(null)
  const viewedRows = ref<Set<string>>(new Set());

  // Cancellation
  let feedController: AbortController | null = null;


  // 1. Initial Load Path
  async function loadUsers(apiPathWithFilters: string): Promise<{ success: boolean; error: APIError | null }> {

    try {

       reset()

        // Spawn a fresh controller instance for this specific execution pass
          feedController = new AbortController();

      // Note: Assuming getAsync is part of your API client layer
      const outcome = await getAsync<GetUserListResponse>(apiPathWithFilters, true, {} as GetUserListResponse,
        feedController.signal
      );

      // Consideration 1: Check if any error and immediately return to caller
      if (outcome.isFailure) {
        return { success: false, error: outcome.error || null };
      }
      
      // Consideration 2: Reconcile updates if data was retrieved
      if (outcome.isSuccess && outcome.value?.users?.length) {

        // Commit clean data to store state
        hasNext.value = outcome.value.hasNext;
        pointer.value = outcome.value.pointer;
        anchor.value = outcome.value.anchor;

        users.value = outcome.value.users;

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
  async function loadMoreUsers() {

    if (isFetchingMore.value || !hasNext.value) return;

    isFetchingMore.value = true;

    try {

        // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();

        const nextPageUrl = filterStore.buildApiPath(baseRoute.value, pointer.value, anchor.value)

        const outcome = await getAsync<GetUserListResponse>(nextPageUrl, true, {} as GetUserListResponse,
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
                    'Unknown error occured while retrieving user. Refresh page and try again.'
                );
            }

            return
        }

    // Consideration 2: Reconcile updates if data was retrieved
         if (outcome.isSuccess && outcome.value?.users?.length) {
          // Reconcile updates against incoming block (handles slower message brokers)
          
          // Commit clean data to store state
          hasNext.value = outcome.value.hasNext;
          pointer.value = outcome.value.pointer;
          
          // Filter duplicates already caught by state or top navigation creations
          const existingIds = new HashSetOrSet(users.value.map(t => t.accountId));
          // 1. Filter out duplicates and immediately shape the raw inputs into valid DTO structures
          const freshItems = outcome.value.users
            .filter((t: any) => !existingIds.has(t.accountId));

           users.value.push(...freshItems);
      
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
  async function loadUser(userId: string): Promise<{ success: boolean; error: APIError | null }> {
  
    try {
  
      user.value = null
  
        // Spawn a fresh controller instance for this specific execution pass
          feedController = new AbortController();
  
      // Note: Assuming getAsync is part of your API client layer
      const outcome = await getAsync<UserDetailDto>(`api/users/checklist/${userId}`, true, {} as UserDetailDto, feedController.signal);
  
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
          'Sorry. Sorry. We could not find the user you requested. It may have been removed, hidden, or archived.'
        )
        
            return { success: false, error: error }
      }
  
     user.value = outcome.value;
  
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

      async function assignRole(payload: AssignRoleRequest) {
    
        try {
    
          const outcome = await postAsync('/api/roles/assign', payload, true);
    
          if (outcome.isFailure) return { success: false, error: outcome.error };

          if(payload.type != '-1'){

          //Update user within collection
          const index = users.value.findIndex(t => t.accountId === payload.accountId);
          if (index !== -1) {
            const user = users.value[index];
            if (user) {
              user.role = payload.type;
            }
          }
    
          //There is no need because it updates on the fly
          //Update active user
          if(user.value){
            user.value.role = payload.type;
          }
    
          }
        
          return { success: true, error: null };
        } catch (err: any) {
          return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
        }
      }
 
      async function suspendUser(payload: ConfirmRequest) {
    
        try {
    
          const outcome = await postAsync('/api/accounts/suspend', payload, true);
    
          if (outcome.isFailure) return { success: false, error: outcome.error };
        
          const index = users.value.findIndex(t => t.accountId === payload.accountId);
          if (index !== -1) {
            const user = users.value[index];
            if (user) {
              user.status = 'SuspendedByAdmin';
            }
          }
    
          if(user.value){
            user.value.status = 'SuspendedByAdmin';
          }
    
          return { success: true, error: null };
        } catch (err: any) {
          return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
        }
      }
  
      async function reinstateUser(payload: ConfirmRequest) {
    
        try {
    
          const outcome = await postAsync('/api/accounts/reinstate', payload, true);
    
          if (outcome.isFailure) return { success: false, error: outcome.error };
        
          const index = users.value.findIndex(t => t.accountId === payload.accountId);
          if (index !== -1) {
            const user = users.value[index];
            if (user) {
              user.status = 'Active';
            }
          }
    
          if(user.value){
            user.value.status = 'Active';
          }
    
          return { success: true, error: null };
        } catch (err: any) {
          return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
        }
      }
    
      async function banUser(payload: ConfirmRequest) {
    
        try {
    
          const outcome = await postAsync('/api/accounts/ban', payload, true);
    
          if (outcome.isFailure) return { success: false, error: outcome.error };
        
          const index = users.value.findIndex(t => t.accountId === payload.accountId);
          if (index !== -1) {
            const user = users.value[index];
            if (user) {
              user.status = 'BannedByAdmin';
            }
          }
    
          if(user.value){
            user.value.status = 'BannedByAdmin';
          }
    
          return { success: true, error: null };
        } catch (err: any) {
          return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
        }
      }
    

  // 3. Reset State
 function reset() {
    users.value = [];
    user.value = null;
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
    users, user, isFetchingMore, loadMoreError,hasNext, pointer, baseRoute, viewedRows,
    setBaseRoute, loadUsers, loadMoreUsers, loadUser, assignRole, suspendUser, reinstateUser, banUser, reset, abort
  };

});