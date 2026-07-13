<script setup lang="ts">

// --- IMPORTS ---
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLogStore } from '../stores/LogStore';
import { useLogListFilterStore } from '../stores/LogListFilterStore'; 
import DisplayComponent from '@/components/DisplayTable.vue';
import InfiniteScroller from '@/components/InfiniteScroller.vue';
import PageStatusMessage from '@/components/PageMessageStatus.vue';
import { APIError } from '@/api/apiTypes';
import { useModalStore } from '@/stores/modalStore'
import { toLongDate } from '@/utils/dateExtensions'
import { LevelTypeDescriptions } from '@/utils/descriptors'

// --- INITIALIZE STORES ---
const logStore = useLogStore();
const logFilterStore = useLogListFilterStore();
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
  const { isClean } = logFilterStore.rehydrate(route.query);

  // 2. 🛑 INTERCEPT TRASH: If parameters were stripped, update browser bar and halt!
  if (!isClean) {
    console.log('[Firewall] Stomping out double API call. Syncing browser string first...')
    
    wasCleaned.value  = true

    await router.replace({
      path: route.path,
      query: logFilterStore.getAsDictionary()
    })
    
    // Abort this execution flow completely! 
    // The router update triggers your route.query watcher, handling the fetch smoothly.
    return
  }

  // 1. Hydrate the Filter Store using the current active route parameters
  //logFilterStore.rehydrate(route.query);

  // 2. Build the targeted API request endpoint string from those validated details
  // 🛡️ Fix 4: Changed 'filterStore' to your actual variable 'logFilterStore'
  const cleanApiPath = logFilterStore.buildApiPath(logStore.baseRoute);

  // 3. Fetch from store
  const { success, error } = await logStore.loadLogs(cleanApiPath)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving logs. Refresh page and try again.'
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
  logStore.abort();
});


const openModal = (logId: string) => {
  logStore.viewedRows.add(logId);
  modalStore.push('LogDetail', 'Log Details', logId)
};

const handleKeyPress = (event: KeyboardEvent, item: any) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openModal(item.logId);
  }
};


const reset = async () => {
  // 1. Wipe out any loaded log arrays or pagination tokens from your main store
   logStore.reset();

  // 2. Instruct the filter store to reset its internal states to defaults
  logFilterStore.reset();

  // 3. Push the clean, default dictionary parameters straight into the browser bar
  // This satisfies your firewall's `isClean` condition on the next cycle!
  await router.push({
    path: route.path,
    query: logFilterStore.getAsDictionary()
  });
};

</script>

<template>

 <template v-if="isLoading">

    <div class="shared__page-title">
    <h1>Loading Logs... </h1>
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

  <template v-else-if="!logStore.logs || logStore.logs.length === 0">

    <PageStatusMessage 
    title="No Content!"
    message="Sorry. No logs were found matching your filter requirements.">
       <template #actions>
      <button class="btn primary" @click="reset">Reset</button>
    </template>
    </PageStatusMessage>

  </template>

  <template v-else>

    <div class="shared__page-title">
      <h1>Logs</h1>
        <button class="btn primary" @click="modalStore.push('LogListFilter', 'Filter Logs')">Filter</button>
    </div>

      <InfiniteScroller
        :has-next="logStore.hasNext"
        :is-fetching="logStore.isFetchingMore"
        :error="logStore.loadMoreError"
        @load-more="logStore.loadMoreLogs"
        @retry="logStore.loadMoreLogs">

      <DisplayComponent
        :items="logStore.logs"
        :item-key="(item) => item.logId"
        :is-row-highlighted="(item) => logStore.viewedRows.has(item.logId)"
        @row-click="(item: any) => openModal(item.logId)"
        @row-key-down="handleKeyPress">

        <template #header>
          <th>Date</th>
          <th>Level</th>
          <th>Message</th>
        </template>

        <template #row="{ item }">
          <td>{{ toLongDate(item.date) }}</td>
          <td><span class="box" :class="LevelTypeDescriptions[item.level]">{{ item.level }}</span></td>
          <td>{{ item.message }}</td>
        </template>
      </DisplayComponent>
    </InfiniteScroller>
  </template>

</template>
