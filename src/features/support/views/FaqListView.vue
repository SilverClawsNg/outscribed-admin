<script setup lang="ts">

// --- IMPORTS ---
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFaqStore } from '../stores/FaqStore';
import { useFaqListFilterStore } from '../stores/FaqListFilterStore'; 
import DisplayComponent from '@/components/DisplayTable.vue';
import InfiniteScroller from '@/components/InfiniteScroller.vue';
import PageStatusMessage from '@/components/PageMessageStatus.vue';
import { APIError } from '@/api/apiTypes';
import { useModalStore } from '@/stores/modalStore'
import { toLongDate } from '@/utils/dateExtensions'
import { FaqCategoryDescriptions } from '@/utils/descriptors'

// --- INITIALIZE STORES ---
const faqStore = useFaqStore();
const faqFilterStore = useFaqListFilterStore();
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
  const { isClean } = faqFilterStore.rehydrate(route.query);

  // 2. 🛑 INTERCEPT TRASH: If parameters were stripped, update browser bar and halt!
  if (!isClean) {
    console.log('[Firewall] Stomping out double API call. Syncing browser string first...')
    
    wasCleaned.value  = true

    await router.replace({
      path: route.path,
      query: faqFilterStore.getAsDictionary()
    })
    
    // Abort this execution flow completely! 
    // The router update triggers your route.query watcher, handling the fetch smoothly.
    return
  }

   // Build api path from a guarnateed clean filter store
  const cleanApiPath = faqFilterStore.buildApiPath(faqStore.baseRoute);

  // 3. Fetch from store
  const { success, error } = await faqStore.loadFaqs(cleanApiPath)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving faqs. Refresh page and try again.'
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
  faqStore.abort();
});


const openModal = (faqId: string) => {
  faqStore.viewedRows.add(faqId);
  modalStore.push('FaqDetail', 'FAQ Details', faqId)
};

const handleKeyPress = (event: KeyboardEvent, item: any) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openModal(item.faqId);
  }
};


const reset = async () => {
  // 1. Wipe out any loaded faq arrays or pagination tokens from your main store
   faqStore.reset();

  // 2. Instruct the filter store to reset its internal states to defaults
  faqFilterStore.reset();

  // 3. Push the clean, default dictionary parameters straight into the browser bar
  // This satisfies your firewall's `isClean` condition on the next cycle!
  await router.push({
    path: route.path,
    query: faqFilterStore.getAsDictionary()
  });
};


</script>

<template>

 <template v-if="isLoading">

   <div class="shared__page-title">
    <h1>Loading Faqs... </h1>
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

  <template v-else-if="!faqStore.faqs || faqStore.faqs.length === 0">

    <PageStatusMessage 
    title="No Content!"
    message="Sorry. No faq were found matching your filter requirements.">
       <template #actions>
      <button class="btn primary" @click="reset">Reset</button>
       <button class="btn secondary" @click="modalStore.push('CreateFaq', 'New FAQ')">Create</button>
    </template>
    </PageStatusMessage>

  </template>

  <template v-else>

    <div class="shared__page-title">
      <h1>Faqs</h1>
      <p>
         <button @click="modalStore.push('CreateFaq', 'New FAQ')">Create FAQ</button>
      </p>
        <button class="btn primary" @click="modalStore.push('FaqListFilter', 'Filter Faq')">Filter</button>
    </div>

      <InfiniteScroller
        :has-next="faqStore.hasNext"
        :is-fetching="faqStore.isFetchingMore"
        :error="faqStore.loadMoreError"
        @load-more="faqStore.loadMoreFaqs"
        @retry="faqStore.loadMoreFaqs">

      <DisplayComponent
        :items="faqStore.faqs"
        :item-key="(item) => item.faqId"
        :is-row-highlighted="(item) => faqStore.viewedRows.has(item.faqId)"
        @row-click="(item: any) => openModal(item.faqId)"
        @row-key-down="handleKeyPress">

        <template #header>
               <th>Date</th>
              <th>Category</th>
              <th>Question</th>
        </template>

        <template #row="{ item }">
          <td>{{ toLongDate(item.lastUpdatedAt) }}</td>
          <td>{{ FaqCategoryDescriptions[item.category] }}</td>
           <td>{{ item.question }}</td>
        </template>
      </DisplayComponent>
    </InfiniteScroller>
  </template>


</template>
