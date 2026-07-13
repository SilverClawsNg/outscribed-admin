<script setup lang="ts">

// --- IMPORTS ---
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTaleStore } from '../stores/TaleStore';
import { useTaleListFilterStore } from '../stores/TaleListFilterStore'; 
import DisplayComponent from '@/components/DisplayTable.vue';
import InfiniteScroller from '@/components/InfiniteScroller.vue';
import PageMessageStatus from '@/components/PageMessageStatus.vue';
import { APIError } from '@/api/apiTypes';
import { useModalStore } from '@/stores/modalStore'
import { toLongDate } from '@/utils/dateExtensions'
import { TaleStatusDescriptions } from '@/utils/descriptors'

// --- INITIALIZE STORES ---
const taleStore = useTaleStore();
const taleFilterStore = useTaleListFilterStore();
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
  const { isClean } = taleFilterStore.rehydrate(route.query);

  // 2. 🛑 INTERCEPT TRASH: If parameters were stripped, update browser bar and halt!
  if (!isClean) {
    console.log('[Firewall] Stomping out double API call. Syncing browser string first...')
    
    wasCleaned.value  = true

    await router.replace({
      path: route.path,
      query: taleFilterStore.getAsDictionary()
    })
    
    // Abort this execution flow completely! 
    // The router update triggers your route.query watcher, handling the fetch smoothly.
    return
  }

  // Build api path from a guarnateed clean filter store
  const cleanApiPath = taleFilterStore.buildApiPath(taleStore.baseRoute);

  // 3. Fetch from store
  const { success, error } = await taleStore.loadTales(cleanApiPath)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving tales. Refresh page and try again.'
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
  taleStore.abort();
});

const openModal = (taleId: string) => {
  taleStore.viewedRows.add(taleId);
  modalStore.push('TaleDetail', 'Tale Details', taleId)
};

const handleKeyPress = (event: KeyboardEvent, item: any) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openModal(item.taleId);
  }
};


const reset = async () => {
  // 1. Wipe out any loaded tale arrays or pagination tokens from your main store
   taleStore.reset();

  // 2. Instruct the filter store to reset its internal states to defaults
  taleFilterStore.reset();

  // 3. Push the clean, default dictionary parameters straight into the browser bar
  // This satisfies your firewall's `isClean` condition on the next cycle!
  await router.push({
    path: route.path,
    query: taleFilterStore.getAsDictionary()
  });
};


</script>

<template>

 <template v-if="isLoading">

   <div class="shared__page-title">
    <h1>Loading Tales... </h1>
      <p class="shared__loader"></p>
    </div>

  </template>

 <template v-else-if="loadingError">

    <PageMessageStatus 
      :title="loadingError.title || 'Error Loading Lists'" 
      :message="loadingError.detail || 'An unexpected error occurred.'">
        <template v-if="loadingError.status == 401" #actions>
        <button class="btn primary" @click="redirectToRegister">Login</button>
      </template>
    </PageMessageStatus>

  </template>

  <template v-else-if="!taleStore.tales || taleStore.tales.length === 0">

    <PageMessageStatus 
    title="No Content!"
    message="Sorry. No tale were found matching your filter requirements.">
       <template #actions>
      <button class="btn primary" @click="reset">Reset</button>
    </template>
    </PageMessageStatus>

  </template>

  <template v-else>

    <div class="shared__page-title">
      <h1>Tales</h1>
        <button class="btn primary" @click="modalStore.push('TaleListFilter', 'Filter Tale')">Filter</button>
    </div>

      <InfiniteScroller
        :has-next="taleStore.hasNext"
        :is-fetching="taleStore.isFetchingMore"
        :error="taleStore.loadMoreError"
        @load-more="taleStore.loadMoreTales"
        @retry="taleStore.loadMoreTales">

      <DisplayComponent
        :items="taleStore.tales"
        :item-key="(item) => item.taleId"
        :is-row-highlighted="(item) => taleStore.viewedRows.has(item.taleId)"
        @row-click="(item: any) => openModal(item.taleId)"
        @row-key-down="handleKeyPress">

        <template #header>
                <th>Date</th>
                <th>Status</th>
                <th>Flags</th>
                <th>Creator</th>
                 <th>Title</th>
        </template>

        <template #row="{ item }">
          <td>{{ toLongDate(item.createdAt) }}</td>
          <td>{{ TaleStatusDescriptions[item.status] }}</td>
           <td>{{ item.flagsCount }}</td>
          <td>{{ item.username }}</td>
           <td>{{ item.title }}</td>

        </template>
      </DisplayComponent>
    </InfiniteScroller>
  </template>

</template>
