<script setup lang="ts">

// --- IMPORTS ---
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useVoteStore } from '../stores/VoteStore';
import { useVoteListFilterStore } from '../stores/VoteListFilterStore'; 
import DisplayComponent from '@/components/DisplayTable.vue';
import InfiniteScroller from '@/components/InfiniteScroller.vue';
import PageStatusMessage from '@/components/PageMessageStatus.vue';
import { APIError } from '@/api/apiTypes';
import { useModalStore } from '@/stores/modalStore'
import { toLongDate } from '@/utils/dateExtensions'
import { VoteTypeDescriptions, ContentTypeDescriptions } from '@/utils/descriptors'

// --- INITIALIZE STORES ---
const voteStore = useVoteStore();
const voteFilterStore = useVoteListFilterStore();
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
  const { isClean } = voteFilterStore.rehydrate(route.query);

  // 2. 🛑 INTERCEPT TRASH: If parameters were stripped, update browser bar and halt!
  if (!isClean) {
    console.log('[Firewall] Stomping out double API call. Syncing browser string first...')
    
    wasCleaned.value  = true

    await router.replace({
      path: route.path,
      query: voteFilterStore.getAsDictionary()
    })
    
    // Abort this execution flow completely! 
    // The router update triggers your route.query watcher, handling the fetch smoothly.
    return
  }

  // Build api path from a guarnateed clean filter store
  const cleanApiPath = voteFilterStore.buildApiPath(voteStore.baseRoute);

  // 3. Fetch from store
  const { success, error } = await voteStore.loadVotes(cleanApiPath)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving votes. Refresh page and try again.'
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
  voteStore.abort();
});

const openModal = (voteId: string) => {
  voteStore.viewedRows.add(voteId);
  modalStore.push('VoteDetail', 'Vote Details', voteId)
};

const handleKeyPress = (event: KeyboardEvent, item: any) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openModal(item.voteId);
  }
};

const reset = async () => {
  // 1. Wipe out any loaded vote arrays or pagination tokens from your main store
   voteStore.reset();

  // 2. Instruct the filter store to reset its internal states to defaults
  voteFilterStore.reset();

  // 3. Push the clean, default dictionary parameters straight into the browser bar
  // This satisfies your firewall's `isClean` condition on the next cycle!
  await router.push({
    path: route.path,
    query: voteFilterStore.getAsDictionary()
  });
};

</script>

<template>

 <template v-if="isLoading">

   <div class="shared__page-title">
    <h1>Loading Votes... </h1>
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

  <template v-else-if="!voteStore.votes || voteStore.votes.length === 0">

    <PageStatusMessage 
    title="No Content!"
    message="Sorry. No vote were found matching your filter requirements.">
       <template #actions>
      <button class="btn primary" @click="reset">Reset</button>
    </template>
    </PageStatusMessage>

  </template>


  <template v-else>

    <div class="shared__page-title">
      <h1>Votes</h1>
        <button class="btn primary" @click="modalStore.push('VoteListFilter', 'Filter Vote')">Filter</button>
    </div>

      <InfiniteScroller
        :has-next="voteStore.hasNext"
        :is-fetching="voteStore.isFetchingMore"
        :error="voteStore.loadMoreError"
        @load-more="voteStore.loadMoreVotes"
        @retry="voteStore.loadMoreVotes">

      <DisplayComponent
        :items="voteStore.votes"
        :item-key="(item) => item.voteId"
        :is-row-highlighted="(item) => voteStore.viewedRows.has(item.voteId)"
        @row-click="(item: any) => openModal(item.voteId)"
        @row-key-down="handleKeyPress">

        <template #header>
             <th>Date</th>
              <th>Content</th>
              <th>Type</th>
              <th>Voter</th>
        </template>

        <template #row="{ item }">
          <td>{{ toLongDate(item.votedAt) }}</td>
          <td>{{ ContentTypeDescriptions[item.contentType] }}</td>
          <td>{{ VoteTypeDescriptions[item.voteType] }}</td>
           <td>{{ item.username }}</td>
        </template>
      </DisplayComponent>
    </InfiniteScroller>
  </template>

</template>
