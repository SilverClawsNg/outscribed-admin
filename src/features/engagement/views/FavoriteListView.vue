<script setup lang="ts">

// --- IMPORTS ---
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFavoriteStore } from '../stores/FavoriteStore';
import { useFavoriteListFilterStore } from '../stores/FavoriteListFilterStore'; 
import DisplayComponent from '@/components/DisplayTable.vue';
import InfiniteScroller from '@/components/InfiniteScroller.vue';
import PageStatusMessage from '@/components/PageMessageStatus.vue';
import { APIError } from '@/api/apiTypes';
import { useModalStore } from '@/stores/modalStore'
import { toLongDate } from '@/utils/dateExtensions'
import { ContentTypeDescriptions } from '@/utils/descriptors'

// --- INITIALIZE STORES ---
const favoriteStore = useFavoriteStore();
const favoriteFilterStore = useFavoriteListFilterStore();
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
  const { isClean } = favoriteFilterStore.rehydrate(route.query);

  // 2. 🛑 INTERCEPT TRASH: If parameters were stripped, update browser bar and halt!
  if (!isClean) {
    console.log('[Firewall] Stomping out double API call. Syncing browser string first...')
    
    wasCleaned.value  = true

    await router.replace({
      path: route.path,
      query: favoriteFilterStore.getAsDictionary()
    })
    
    // Abort this execution flow completely! 
    // The router update triggers your route.query watcher, handling the fetch smoothly.
    return
  }

  // Build api path from a guarnateed clean filter store
  const cleanApiPath = favoriteFilterStore.buildApiPath(favoriteStore.baseRoute);

  // 3. Fetch from store
  const { success, error } = await favoriteStore.loadFavorites(cleanApiPath)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving favorites. Refresh page and try again.'
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
  favoriteStore.abort();
});


const openModal = (favoriteId: string) => {
  favoriteStore.viewedRows.add(favoriteId);
 modalStore.push('FavoriteDetail', 'Favorite Details', favoriteId)
};

const handleKeyPress = (event: KeyboardEvent, item: any) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openModal(item.favoriteId);
  }
};


const reset = async () => {
  // 1. Wipe out any loaded favorite arrays or pagination tokens from your main store
   favoriteStore.reset();

  // 2. Instruct the filter store to reset its internal states to defaults
  favoriteFilterStore.reset();

  // 3. Push the clean, default dictionary parameters straight into the browser bar
  // This satisfies your firewall's `isClean` condition on the next cycle!
  await router.push({
    path: route.path,
    query: favoriteFilterStore.getAsDictionary()
  });
};


</script>

<template>

 <template v-if="isLoading">

   <div class="shared__page-title">
    <h1>Loading Favorites... </h1>
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

  <template v-else-if="!favoriteStore.favorites || favoriteStore.favorites.length === 0">

    <PageStatusMessage 
    title="No Content!"
    message="Sorry. No favorite were found matching your filter requirements.">
       <template #actions>
      <button class="btn primary" @click="reset">Reset</button>
    </template>
    </PageStatusMessage>

  </template>

  <template v-else>

    <div class="shared__page-title">
      <h1>Favorites</h1>
        <button class="btn primary" @click="modalStore.push('FavoriteListFilter', 'Filter Favorite')">Filter</button>
    </div>

      <InfiniteScroller
        :has-next="favoriteStore.hasNext"
        :is-fetching="favoriteStore.isFetchingMore"
        :error="favoriteStore.loadMoreError"
        @load-more="favoriteStore.loadMoreFavorites"
        @retry="favoriteStore.loadMoreFavorites">

      <DisplayComponent
        :items="favoriteStore.favorites"
        :item-key="(item) => item.favoriteId"
        :is-row-highlighted="(item) => favoriteStore.viewedRows.has(item.favoriteId)"
        @row-click="(item: any) => openModal(item.favoriteId)"
        @row-key-down="handleKeyPress">

        <template #header>
           <th>Date</th>
           <th>Content</th>
           <th>Favoriter</th>
           <th>IsActive</th>
        </template>

        <template #row="{ item }">
          <td>{{ toLongDate(item.favoritedAt) }}</td>
          <td>{{ ContentTypeDescriptions[item.contentType] }}</td>
           <td>{{ item.username }}</td>
           <td>{{ item.isActive }}</td>
        </template>
      </DisplayComponent>
    </InfiniteScroller>
  </template>

</template>
