<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PageMessageStatus from '@/components/PageMessageStatus.vue';
import { useFavoriteStore } from '../stores/FavoriteStore';
import { toLongDate } from '@/utils/dateExtensions'
import { APIError } from '@/api/apiTypes';
import { useRoute, useRouter } from 'vue-router';
import { useModalStore } from '@/stores/modalStore';
import { ContentTypeDescriptions } from '@/utils/descriptors'

const props = defineProps<{
  payload: unknown // Arrives untouched as the raw string AccountId from your container
}>()

const favoriteId = computed(() => props.payload as string)

const favoriteStore = useFavoriteStore();
const modalStore = useModalStore();

// --- Component Reactive State ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  // 3. Fetch from store
  const { success, error } = await favoriteStore.loadFavorite(favoriteId.value)

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

// --- MOUNT PAGE ---
onMounted(async () => {
  await initPage();
})

</script>

<template>
 
 <template v-if="isLoading">

   <div class="favorited__page-title">
    <h1>Loading Favorites... </h1>
      <p class="favorited__loader"></p>
    </div>

  </template>

 <template v-else-if="loadingError">

    <PageMessageStatus 
      :title="loadingError.title || 'Error Loading Lists'" 
      :message="loadingError.detail || 'An unexpected error occurred.'">
        <template v-if="loadingError.status == 401" #actions>
        <button class="btn primary" @click="modalStore.push('Register', 'Register')">Login</button>
      </template>
    </PageMessageStatus>

  </template>

  <!-- Core Body View Template -->
  <template v-else-if="favoriteStore.favorite">
    
    <dl>
      <dt>Date</dt>
      <dd>{{ toLongDate(favoriteStore.favorite.favoritedAt) }}</dd>
    </dl>

    <dl>
      <dt>User</dt>
      <dd>
        {{ favoriteStore.favorite.username }}
        <button @click="modalStore.push('UserDetail', 'User Details', favoriteStore.favorite.favoriterId)">
          View
        </button>
      </dd>
    </dl>

    <dl>
      <dt>Content Type</dt>
      <dd>
        {{ ContentTypeDescriptions[favoriteStore.favorite.contentType] }}
       <template v-if="favoriteStore.favorite.contentType === 'Tale'">
        <button @click="modalStore.push('TaleDetail', 'Tale Details', favoriteStore.favorite.contentId)">
          View
        </button>
      </template>
      <template v-if="favoriteStore.favorite.contentType === 'Insight'">
        <button @click="modalStore.push('InsightDetail', 'Insight Details', favoriteStore.favorite.contentId)">
          View
        </button>
      </template>
       <template v-if="favoriteStore.favorite.contentType === 'Comment'">
        <button @click="modalStore.push('CommentDetail', 'Comment Details', favoriteStore.favorite.contentId)">
          View
        </button>
      </template>
      </dd>
     
    </dl>

    <dl>
      
       <dt>Is Active</dt>
        <dd>
        {{ favoriteStore.favorite.isActive }}
      </dd>
    </dl>

  </template>

  <template v-else>

    <PageStatusMessage 
    title="500: Unknown Error!"
    message="An unknown error occurred while retrieving the favorite. Refresh page and try again.">
    </PageStatusMessage>

  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/description-list";
</style>