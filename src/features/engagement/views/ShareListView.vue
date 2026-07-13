<script setup lang="ts">

// --- IMPORTS ---
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useShareStore } from '../stores/ShareStore';
import { useShareListFilterStore } from '../stores/ShareListFilterStore'; 
import DisplayComponent from '@/components/DisplayTable.vue';
import InfiniteScroller from '@/components/InfiniteScroller.vue';
import PageStatusMessage from '@/components/PageMessageStatus.vue';
import { APIError } from '@/api/apiTypes';
import { useModalStore } from '@/stores/modalStore'
import { toLongDate } from '@/utils/dateExtensions'
import { ContactTypeDescriptions, ContentTypeDescriptions } from '@/utils/descriptors'

// --- INITIALIZE STORES ---
const shareStore = useShareStore();
const shareFilterStore = useShareListFilterStore();
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
  const { isClean } = shareFilterStore.rehydrate(route.query);

  // 2. 🛑 INTERCEPT TRASH: If parameters were stripped, update browser bar and halt!
  if (!isClean) {
    console.log('[Firewall] Stomping out double API call. Syncing browser string first...')
    
    wasCleaned.value  = true

    await router.replace({
      path: route.path,
      query: shareFilterStore.getAsDictionary()
    })
    
    // Abort this execution flow completely! 
    // The router update triggers your route.query watcher, handling the fetch smoothly.
    return
  }

   // Build api path from a guarnateed clean filter store
  const cleanApiPath = shareFilterStore.buildApiPath(shareStore.baseRoute);

  // 3. Fetch from store
  const { success, error } = await shareStore.loadShares(cleanApiPath)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving shares. Refresh page and try again.'
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
  shareStore.abort();
});


const openModal = (shareId: string) => {
  shareStore.viewedRows.add(shareId);
 modalStore.push('ShareDetail', 'Shared Details', shareId)
};

const handleKeyPress = (event: KeyboardEvent, item: any) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openModal(item.shareId);
  }
};


const reset = async () => {
  // 1. Wipe out any loaded share arrays or pagination tokens from your main store
   shareStore.reset();

  // 2. Instruct the filter store to reset its internal states to defaults
  shareFilterStore.reset();

  // 3. Push the clean, default dictionary parameters straight into the browser bar
  // This satisfies your firewall's `isClean` condition on the next cycle!
  await router.push({
    path: route.path,
    query: shareFilterStore.getAsDictionary()
  });
};


</script>

<template>

 <template v-if="isLoading">

   <div class="shared__page-title">
    <h1>Loading Shares... </h1>
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

  <template v-else-if="!shareStore.shares || shareStore.shares.length === 0">

    <PageStatusMessage 
    title="No Content!"
    message="Sorry. No share were found matching your filter requirements.">
       <template #actions>
      <button class="btn primary" @click="reset">Reset</button>
    </template>
    </PageStatusMessage>

  </template>

  <template v-else>

    <div class="shared__page-title">
      <h1>Shares</h1>
        <button class="btn primary" @click="modalStore.push('ShareListFilter', 'Filter Share')">Filter</button>
    </div>

      <InfiniteScroller
        :has-next="shareStore.hasNext"
        :is-fetching="shareStore.isFetchingMore"
        :error="shareStore.loadMoreError"
        @load-more="shareStore.loadMoreShares"
        @retry="shareStore.loadMoreShares">

      <DisplayComponent
        :items="shareStore.shares"
        :item-key="(item) => item.shareId"
        :is-row-highlighted="(item) => shareStore.viewedRows.has(item.shareId)"
        @row-click="(item: any) => openModal(item.shareId)"
        @row-key-down="handleKeyPress">

        <template #header>
             <th>Date</th>
              <th>Content</th>
              <th>Contact</th>
              <th>Sharer</th>
        </template>

        <template #row="{ item }">
          <td>{{ toLongDate(item.sharedAt) }}</td>
          <td>{{ ContentTypeDescriptions[item.contentType] }}</td>
          <td>{{ ContactTypeDescriptions[item.contactType] }}</td>
           <td>{{ item.username }}</td>
        </template>
      </DisplayComponent>
    </InfiniteScroller>
  </template>

</template>
