import { defineStore } from 'pinia';
import { ref } from 'vue';
import { APIError } from '@/api/apiTypes';
import type {AdminListDto, GetAdminListResponse, AdminDetailDto, ConfirmRequest, 
  ResetRequest} from '../types/GatekeeperTypes'
import { useAdminListFilterStore } from './AdminListFilterStore'
import { getAsync } from '@/api/apiGetServices'
import { postAsync } from '@/api/apiPostServices'

// Native JS Set wrapper implementation shortcut
class HashSetOrSet extends Set<string> {}

export const useAdminStore = defineStore('adminStore', () => {

   // State
  const admins = ref<AdminListDto[]>([]);
  const admin = ref<AdminDetailDto | null>(null);

  //Filter
  const filterStore = useAdminListFilterStore()

   // Loading and Tracking flags matching your C# states
  const isFetchingMore = ref<boolean>(false);
  const hasNext = ref<boolean>(false);
  const pointer = ref<string | number>('1');
  const anchor = ref<string | null>(null);
  const baseRoute = ref<string>('/api/admins/checklist'); 
  const loadMoreError = ref<APIError | null>(null)
  const viewedRows = ref<Set<string>>(new Set());

  // Cancellation
  let feedController: AbortController | null = null;


  // 1. Initial Load Path
  async function loadAdmins(apiPathWithFilters: string): Promise<{ success: boolean; error: APIError | null }> {

    try {

        // Spawn a fresh controller instance for this specific execution pass
          feedController = new AbortController();

      // Note: Assuming getAsync is part of your API client layer
      const outcome = await getAsync<GetAdminListResponse>(apiPathWithFilters, true, {} as GetAdminListResponse,
        feedController.signal
      );

      // Consideration 1: Check if any error and immediately return to caller
      if (outcome.isFailure) {
        return { success: false, error: outcome.error || null };
      }
      
      // Consideration 2: Reconcile updates if data was retrieved
      if (outcome.isSuccess && outcome.value?.admins?.length) {

        // Commit clean data to store state
        hasNext.value = outcome.value.hasNext;
        pointer.value = outcome.value.pointer;
        anchor.value = outcome.value.anchor;

        admins.value = outcome.value.admins;

      } else {
        // Clear store list if server explicitly returned nothing/null to prevent stale state bleed
        reset()
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
  async function loadMoreAdmins() {

    if (isFetchingMore.value || !hasNext.value) return;

    isFetchingMore.value = true;

    try {

        // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();

        const nextPageUrl = filterStore.buildApiPath(baseRoute.value, pointer.value, anchor.value)

        const outcome = await getAsync<GetAdminListResponse>(nextPageUrl, true, {} as GetAdminListResponse,
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
                    'Unknown error occured while retrieving admin. Refresh page and try again.'
                );
            }

            return
        }

    // Consideration 2: Reconcile updates if data was retrieved
         if (outcome.isSuccess && outcome.value?.admins?.length) {
          // Reconcile updates against incoming block (handles slower message brokers)
          
          // Commit clean data to store state
          hasNext.value = outcome.value.hasNext;
          pointer.value = outcome.value.pointer;
          
          // Filter duplicates already caught by state or top navigation creations
          const existingIds = new HashSetOrSet(admins.value.map(t => t.authenticationId));
          // 1. Filter out duplicates and immediately shape the raw inputs into valid DTO structures
          const freshItems = outcome.value.admins
            .filter((t: any) => !existingIds.has(t.authenticationId));

           admins.value.push(...freshItems);
      
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
    async function loadAdmin(authenticationId: string): Promise<{ success: boolean; error: APIError | null }> {
    
      try {
    
        admin.value = null
    
          // Spawn a fresh controller instance for this specific execution pass
            feedController = new AbortController();
    
        // Note: Assuming getAsync is part of your API client layer
        const outcome = await getAsync<AdminDetailDto>(`api/admins/checklist/${authenticationId}`, true, {} as AdminDetailDto, feedController.signal);
    
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
            'Sorry. Sorry. We could not find the admin you requested. It may have been removed, hidden, or archived.'
          )
          
              return { success: false, error: error }
        }
    
        // Consideration 2: Reconcile updates if data was retrieved
        if (outcome.value) {
    
    // 🔄 Map and clean the data stream BEFORE it hits the UI state engine
          admin.value = outcome.value;
        } else {
          // Clear store list if server explicitly returned nothing/null to prevent suser state bleed
          admin.value = null;
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
  
  async function reassignRole(payload: ConfirmRequest) {

   try {
        
        const outcome = await postAsync('/api/roles/reassign', payload, true);
        
        if (outcome.isFailure) return { success: false, error: outcome.error };
        
         if(payload.type != '-1'){
    
              //Update user within collection
          const index = admins.value.findIndex(t => t.authenticationId === payload.authenticationId);
          if (index !== -1) {
              const admin = admins.value[index];
              if (admin) {
                admin.role = payload.type;
            }
          }
        
              //Update active user
          if(admin.value){
            admin.value.role = payload.type;
          }
        
          }
            
              return { success: true, error: null };
            } catch (err: any) {
              return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
            }
  }         
   
  async function activateRole(payload: ConfirmRequest) {

   try {
        
        const outcome = await postAsync('/api/roles/activate', payload, true);
        
        if (outcome.isFailure) return { success: false, error: outcome.error };
        
           //Update user within collection
          const index = admins.value.findIndex(t => t.authenticationId === payload.authenticationId);
          if (index !== -1) {
              const admin = admins.value[index];
              if (admin) {
                admin.isActive = true;
            }
          }
        
              //Update active user
          if(admin.value){
           admin.value.isActive = true;
          }
            
              return { success: true, error: null };
            } catch (err: any) {
              return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
            }
  }            
      
  async function deactivateRole(payload: ConfirmRequest) {

   try {
        
        const outcome = await postAsync('/api/roles/deactivate', payload, true);
        
        if (outcome.isFailure) return { success: false, error: outcome.error };
        
            //Update user within collection
          const index = admins.value.findIndex(t => t.authenticationId === payload.authenticationId);
          if (index !== -1) {
              const admin = admins.value[index];
              if (admin) {
                admin.isActive = false;
            }
          }
        
              //Update active user
          if(admin.value){
           admin.value.isActive = false;
          }
            
              return { success: true, error: null };
            } catch (err: any) {
              return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
            }
  }   

  async function resetSecurityStatus(payload: ResetRequest) {

   try {
        
        const outcome = await postAsync('/api/twofactor/reset', payload, true);
        
        if (outcome.isFailure) return { success: false, error: outcome.error };
        
         //Update active user
          if(admin.value){
           admin.value.securityStatus = 'NoTwoFactorEnabled';
          }
            
              return { success: true, error: null };
            } catch (err: any) {
              return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
            }
  }        


  // 3. Reset State
 function reset() {
    admins.value = [];
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
    admins, admin, isFetchingMore, loadMoreError,hasNext, pointer, baseRoute, viewedRows,
    setBaseRoute, loadAdmins, loadMoreAdmins, loadAdmin, reassignRole, deactivateRole, activateRole, resetSecurityStatus, 
    reset, abort
  };

});