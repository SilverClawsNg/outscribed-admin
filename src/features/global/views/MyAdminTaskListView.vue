<script setup lang="ts">

// --- IMPORTS ---
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMyAdminTaskStore } from '../stores/MyAdminTaskStore';
import { useMyAdminTaskListFilterStore } from '../stores/MyAdminTaskListFilterStore'; 
import DisplayComponent from '@/components/DisplayTable.vue';
import InfiniteScroller from '@/components/InfiniteScroller.vue';
import PageStatusMessage from '@/components/PageMessageStatus.vue';
import { APIError } from '@/api/apiTypes';
import { useModalStore } from '@/stores/modalStore'
import { toLongDate } from '@/utils/dateExtensions'
import { AdminTaskTypeDescriptions, ContentTypeDescriptions } from '@/utils/descriptors'
import { useGatekeeperStore } from '@/features/gatekeeper/stores/GatekeeperStore'; 

// --- INITIALIZE STORES ---
const taskStore = useMyAdminTaskStore();
const taskFilterStore = useMyAdminTaskListFilterStore();
const modalStore = useModalStore()
const gatekeeperStore = useGatekeeperStore()

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
  const { isClean } = taskFilterStore.rehydrate(route.query);

  // 2. 🛑 INTERCEPT TRASH: If parameters were stripped, update browser bar and halt!
  if (!isClean) {
    console.log('[Firewall] Stomping out double API call. Syncing browser string first...')
    
    wasCleaned.value  = true

    await router.replace({
      path: route.path,
      query: taskFilterStore.getAsDictionary()
    })
    
    // Abort this execution flow completely! 
    // The router update triggers your route.query watcher, handling the fetch smoothly.
    return
  }

   // Build api path from a guarnateed clean filter store
  const cleanApiPath = taskFilterStore.buildApiPath(taskStore.baseRoute);

  // 3. Fetch from store
  const { success, error } = await taskStore.loadTasks(cleanApiPath)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving tasks. Refresh page and try again.'
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
  taskStore.abort();
});


const openModal = (adminTaskId: string) => {
  taskStore.viewedRows.add(adminTaskId);
  modalStore.push('AdminTaskDetail', 'Admin Task Details', adminTaskId)
};

const handleKeyPress = (event: KeyboardEvent, item: any) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openModal(item.adminTaskId);
  }
};

const triggerFilterModal = async () => {
  // Push your modal filter criteria layout...
  // Then smoothly update the route parameters:
  // router.push({ query: { ...newFilters } })
};

const reset = async () => {
  // 1. Wipe out any loaded task arrays or pagination tokens from your main store
   taskStore.reset();

  // 2. Instruct the filter store to reset its internal states to defaults
  taskFilterStore.reset();

  // 3. Push the clean, default dictionary parameters straight into the browser bar
  // This satisfies your firewall's `isClean` condition on the next cycle!
  await router.push({
    path: route.path,
    query: taskFilterStore.getAsDictionary()
  });
};


</script>

<template>

 <template v-if="isLoading">

   <div class="shared__page-title">
    <h1>Loading Tasks... </h1>
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

  <template v-else-if="!taskStore.tasks || taskStore.tasks.length === 0">

    <PageStatusMessage 
    title="No Content!"
    message="Sorry. No tasks were found matching your filter requirements. ">
       <template #actions>
      <button class="btn primary" @click="reset">Reset</button>
    </template>
    </PageStatusMessage>

  </template>

  <template v-else>

    <div class="shared__page-title">
      <h1>Tasks </h1>
      <button class="btn secondary" @click="triggerFilterModal">Filter</button>
    </div>

      <InfiniteScroller
        :has-next="taskStore.hasNext"
        :is-fetching="taskStore.isFetchingMore"
        :error="taskStore.loadMoreError"
        @load-more="taskStore.loadMoreTasks"
        @retry="taskStore.loadMoreTasks">

      <DisplayComponent
        :items="taskStore.tasks"
        :item-key="(item) => item.adminTaskId"
        :is-row-highlighted="(item) => taskStore.viewedRows.has(item.adminTaskId)"
        @row-click="(item: any) => openModal(item.adminTaskId)"
        @row-key-down="handleKeyPress">

        <template #header>
          <th>Date</th>
          <th>Admin</th>
          <th>Task</th>
          <th>Content Type</th>
        </template>

        <template #row="{ item }">
          <td>{{ toLongDate(item.completedAt) }}</td>
          <td>{{ item.adminUsername }}</td>
          <td>{{ AdminTaskTypeDescriptions[item.adminTaskType] }}</td>
          <td>{{ ContentTypeDescriptions[item.contentType] }}</td>
        </template>
      </DisplayComponent>
    </InfiniteScroller>
  </template>

</template>