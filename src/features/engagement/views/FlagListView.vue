<script setup lang="ts">

// --- IMPORTS ---
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFlagStore } from '../stores/FlagStore';
import { useFlagListFilterStore } from '../stores/FlagListFilterStore'; 
import DisplayComponent from '@/components/DisplayTable.vue';
import InfiniteScroller from '@/components/InfiniteScroller.vue';
import PageStatusMessage from '@/components/PageMessageStatus.vue';
import { APIError } from '@/api/apiTypes';
import { useModalStore } from '@/stores/modalStore'
import { toLongDate } from '@/utils/dateExtensions'
import { FlagTypeDescriptions, ContentTypeDescriptions } from '@/utils/descriptors'

// --- INITIALIZE STORES ---
const flagStore = useFlagStore();
const flagFilterStore = useFlagListFilterStore();
const modalStore = useModalStore()
const route = useRoute();
const router = useRouter();

// --- DEFINE & INITIALIZE LOCAL VARIABLES ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)
const wasCleaned = ref(false)
const currentPath = encodeURIComponent(route.fullPath)


// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  console.log('🚀 [Tale Lists View]: Presence verified via hint. Dispatching data fetch...')

  // 1. Hydrate and check if the incoming URL string was pristine
  const { isClean } = flagFilterStore.rehydrate(route.query);

  // 2. 🛑 INTERCEPT TRASH: If parameters were stripped, update browser bar and halt!
  if (!isClean) {
    console.log('[Firewall] Stomping out double API call. Syncing browser string first...')
    
    wasCleaned.value  = true

    await router.replace({
      path: route.path,
      query: flagFilterStore.getAsDictionary()
    })
    
    // Abort this execution flow completely! 
    // The router update triggers your route.query watcher, handling the fetch smoothly.
    return
  }

   // Build api path from a guarnateed clean filter store
  const cleanApiPath = flagFilterStore.buildApiPath(flagStore.baseRoute);

  // 3. Fetch from store
  const { success, error } = await flagStore.loadFlags(cleanApiPath)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving flags. Refresh page and try again.'
      );
  }
  }

  // No matter the result, stop loading
  isLoading.value = false

}


// --- DEFINE PAGE FUNCTIONS ---
function redirectToRegister() {
  router.push(`/register?returnUrl=${currentPath}`)
}


// --- MOUNT PAGE ---
onMounted(async () => {
  await initPage();
})

// Watch for browser navigation query parameters changing (Handles back/forward buttons cleanly)
watch(() => route.query, () => {
  initPage();
}, { deep: true });


// inside your HomeView.vue
onUnmounted(() => {
  flagStore.abort();
});


const openModal = (flagId: string) => {
  flagStore.viewedRows.add(flagId);
  modalStore.push('FlagDetail', 'Flag Details', flagId)
};

const handleKeyPress = (event: KeyboardEvent, item: any) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openModal(item.flagId);
  }
};


const reset = async () => {
  // 1. Wipe out any loaded flag arrays or pagination tokens from your main store
   flagStore.reset();

  // 2. Instruct the filter store to reset its internal states to defaults
  flagFilterStore.reset();

  // 3. Push the clean, default dictionary parameters straight into the browser bar
  // This satisfies your firewall's `isClean` condition on the next cycle!
  await router.push({
    path: route.path,
    query: flagFilterStore.getAsDictionary()
  });
};

</script>

<template>

 <template v-if="isLoading">

   <div class="shared__page-title">
    <h1>Loading Flags... </h1>
      <p class="shared__loader"></p>
    </div>

  </template>

 <template v-else-if="loadingError">

    <PageStatusMessage 
      :title="loadingError.title || 'Error Loading Lists'" 
      :message="loadingError.detail || 'An unexpected error occurred.'">
        <template v-if="loadingError.status == 401" #actions>
        <button class="btn primary" @click="redirectToRegister">Login</button>
      </template>
    </PageStatusMessage>

  </template>

  <template v-else-if="!flagStore.flags || flagStore.flags.length === 0">

    <PageStatusMessage 
    title="No Content!"
    message="Sorry. No flag were found matching your filter requirements.">
       <template #actions>
      <button class="btn primary" @click="reset">Reset</button>
    </template>
    </PageStatusMessage>

  </template>

  <template v-else>

    <div class="shared__page-title">
      <h1>Flags</h1>
        <button class="btn primary" @click="modalStore.push('FlagListFilter', 'Filter Flag')">Filter</button>
    </div>

      <InfiniteScroller
        :has-next="flagStore.hasNext"
        :is-fetching="flagStore.isFetchingMore"
        :error="flagStore.loadMoreError"
        @load-more="flagStore.loadMoreFlags"
        @retry="flagStore.loadMoreFlags">

      <DisplayComponent
        :items="flagStore.flags"
        :item-key="(item) => item.flagId"
        :is-row-highlighted="(item) => flagStore.viewedRows.has(item.flagId)"
        @row-click="(item: any) => openModal(item.flagId)"
        @row-key-down="handleKeyPress">

        <template #header>
             <th>Date</th>
              <th>Content</th>
              <th>Type</th>
              <th>Flagger</th>
        </template>

        <template #row="{ item }">
          <td>{{ toLongDate(item.flaggedAt) }}</td>
          <td>{{ ContentTypeDescriptions[item.contentType] }}</td>
          <td>{{ FlagTypeDescriptions[item.flagType] }}</td>
           <td>{{ item.username }}</td>
        </template>
      </DisplayComponent>
    </InfiniteScroller>
  </template>

</template>
