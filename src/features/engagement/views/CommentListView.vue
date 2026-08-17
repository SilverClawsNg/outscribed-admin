<script setup lang="ts">

// --- IMPORTS ---
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCommentStore } from '../stores/CommentStore';
import { useCommentListFilterStore } from '../stores/CommentListFilterStore'; 
import DisplayComponent from '@/components/DisplayTable.vue';
import InfiniteScroller from '@/components/InfiniteScroller.vue';
import PageStatusMessage from '@/components/PageMessageStatus.vue';
import { APIError } from '@/api/apiTypes';
import { useModalStore } from '@/stores/modalStore'
import { toLongDate } from '@/utils/dateExtensions'
import { CommentStatusDescriptions, ContentTypeDescriptions } from '@/utils/descriptors'

// --- INITIALIZE STORES ---
const commentStore = useCommentStore();
const commentFilterStore = useCommentListFilterStore();
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
  const { isClean } = commentFilterStore.rehydrate(route.query);

  // 2. 🛑 INTERCEPT TRASH: If parameters were stripped, update browser bar and halt!
  if (!isClean) {
    console.log('[Firewall] Stomping out double API call. Syncing browser string first...')
    
    wasCleaned.value  = true

    await router.replace({
      path: route.path,
      query: commentFilterStore.getAsDictionary()
    })
    
    // Abort this execution flow completely! 
    // The router update triggers your route.query watcher, handling the fetch smoothly.
    return
  }

   // Build api path from a guarnateed clean filter store
  const cleanApiPath = commentFilterStore.buildApiPath(commentStore.baseRoute);

  // 3. Fetch from store
  const { success, error } = await commentStore.loadComments(cleanApiPath)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving comments. Refresh page and try again.'
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
  commentStore.abort();
});


const openModal = (commentId: string) => {
  commentStore.viewedRows.add(commentId);
  modalStore.push('CommentDetail', 'Comment Details', commentId)
};

const handleKeyPress = (event: KeyboardEvent, item: any) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openModal(item.commentId);
  }
};


const reset = async () => {
  // 1. Wipe out any loaded comment arrays or pagination tokens from your main store
   commentStore.reset();

  // 2. Instruct the filter store to reset its internal states to defaults
  commentFilterStore.reset();

  // 3. Push the clean, default dictionary parameters straight into the browser bar
  // This satisfies your firewall's `isClean` condition on the next cycle!
  await router.push({
    path: route.path,
    query: commentFilterStore.getAsDictionary()
  });
};


</script>

<template>

 <template v-if="isLoading">

   <div class="shared__page-title">
    <h1>Loading Comments... </h1>
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

  <template v-else-if="!commentStore.comments || commentStore.comments.length === 0">

    <PageStatusMessage 
    title="No Content!"
    message="Sorry. No comment were found matching your filter requirements.">
       <template #actions>
      <button class="btn primary" @click="reset">Reset</button>
    </template>
    </PageStatusMessage>

  </template>

  <template v-else>

    <div class="shared__page-title">
      <h1>Comments</h1>
        <button class="btn primary" @click="modalStore.push('CommentListFilter', 'Filter Comment')">Filter</button>
    </div>

      <InfiniteScroller
        :has-next="commentStore.hasNext"
        :is-fetching="commentStore.isFetchingMore"
        :error="commentStore.loadMoreError"
        @load-more="commentStore.loadMoreComments"
        @retry="commentStore.loadMoreComments">

      <DisplayComponent
        :items="commentStore.comments"
        :item-key="(item) => item.commentId"
        :is-row-highlighted="(item) => commentStore.viewedRows.has(item.commentId)"
        @row-click="(item: any) => openModal(item.commentId)"
        @row-key-down="handleKeyPress">

        <template #header>
             <th>Date</th>
              <th>Content</th>
              <th>Status</th>
              <th>Commentator</th>
              <th>Flags</th>
              <th>Comment</th>
        </template>

        <template #row="{ item }">
          <td>{{ toLongDate(item.commentedAt) }}</td>
          <td>{{ ContentTypeDescriptions[item.contentType] }}</td>
          <td>{{ CommentStatusDescriptions[item.status] }}</td>
           <td>{{ item.username }}</td>
           <td>{{ item.flagsCount }}</td>
          <td>{{ item.detail }}</td>
        </template>
      </DisplayComponent>
    </InfiniteScroller>
  </template>


</template>
