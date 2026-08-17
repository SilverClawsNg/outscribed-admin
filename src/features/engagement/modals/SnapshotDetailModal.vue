<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PageMessageStatus from '@/components/PageMessageStatus.vue';
import { useSnapshotStore } from '../stores/SnapshotStore';
import { toLongDate } from '@/utils/dateExtensions'
import { APIError } from '@/api/apiTypes';
import { useRoute, useRouter } from 'vue-router';
import { useModalStore } from '@/stores/modalStore';
import { ContentTypeDescriptions } from '@/utils/descriptors'

const props = defineProps<{
  payload: unknown // Arrives untouched as the raw string AccountId from your container
}>()

const snapshotId = computed(() => props.payload as string)

const snapshotStore = useSnapshotStore();
const modalStore = useModalStore();

// --- Component Reactive State ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  // 3. Fetch from store
  const { success, error } = await snapshotStore.loadSnapshot(snapshotId.value)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving snapshots. Refresh page and try again.'
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

   <div class="snapshotd__page-title">
    <h1>Loading Snapshots... </h1>
      <p class="snapshotd__loader"></p>
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
  <template v-else-if="snapshotStore.snapshot">
    
    <dl>
      <dt>Date</dt>
      <dd>{{ toLongDate(snapshotStore.snapshot.date) }}</dd>
    </dl>

    <dl>
      <dt>Content Type</dt>
      <dd>
        {{ ContentTypeDescriptions[snapshotStore.snapshot.contentType] }}
       <template v-if="snapshotStore.snapshot.contentType === 'Tale'">
        <button @click="modalStore.push('TaleDetail', 'Tale Details', snapshotStore.snapshot.contentId)">
          View
        </button>
      </template>
      <template v-if="snapshotStore.snapshot.contentType === 'Insight'">
        <button @click="modalStore.push('InsightDetail', 'Insight Details', snapshotStore.snapshot.contentId)">
          View
        </button>
      </template>
       <template v-if="snapshotStore.snapshot.contentType === 'Comment'">
        <button @click="modalStore.push('CommentDetail', 'Comment Details', snapshotStore.snapshot.contentId)">
          View
        </button>
      </template>
      </dd>
     
    </dl>

     <dl>
        <dt>Total Engagements</dt>
        <dd>
        {{ snapshotStore.snapshot.totalCounts }}
      </dd>
     </dl>
      <template v-if="snapshotStore.snapshot.viewsCount && snapshotStore.snapshot.viewsCount != 0">
  <dl>
        <dt>Views Count</dt>
        <dd>
        {{ snapshotStore.snapshot.viewsCount }}
      </dd>
     </dl>
     </template>
      <template v-if="snapshotStore.snapshot.authViewsCount && snapshotStore.snapshot.authViewsCount != 0">
 <dl>
        <dt>Auth Views Count</dt>
        <dd>
        {{ snapshotStore.snapshot.authViewsCount }}
      </dd>
     </dl>
     </template>
     <template v-if="snapshotStore.snapshot.talesCount && snapshotStore.snapshot.talesCount != 0">
 <dl>
        <dt>Tales Count</dt>
        <dd>
        {{ snapshotStore.snapshot.talesCount }}
      </dd>
     </dl>
     </template>
      <template v-if="snapshotStore.snapshot.insightsCount && snapshotStore.snapshot.insightsCount != 0">
 <dl>
        <dt>Insights Count</dt>
        <dd>
        {{ snapshotStore.snapshot.insightsCount }}
      </dd>
     </dl>
     </template>
      <template v-if="snapshotStore.snapshot.commentsCount && snapshotStore.snapshot.commentsCount != 0">
 <dl>
        <dt>Comments Count</dt>
        <dd>
        {{ snapshotStore.snapshot.commentsCount }}
      </dd>
     </dl>
     </template>
       <template v-if="snapshotStore.snapshot.upvotesCount && snapshotStore.snapshot.upvotesCount != 0">
 <dl>
        <dt>Upvotes Count</dt>
        <dd>
        {{ snapshotStore.snapshot.upvotesCount }}
      </dd>
     </dl>
     </template>
 <template v-if="snapshotStore.snapshot.downvotesCount && snapshotStore.snapshot.downvotesCount != 0">
 <dl>
        <dt>Downvotes Count</dt>
        <dd>
        {{ snapshotStore.snapshot.downvotesCount }}
      </dd>
     </dl>
     </template>
      <template v-if="snapshotStore.snapshot.sharesCount && snapshotStore.snapshot.sharesCount != 0">
 <dl>
        <dt>Shares Count</dt>
        <dd>
        {{ snapshotStore.snapshot.sharesCount }}
      </dd>
     </dl>
     </template>
      <template v-if="snapshotStore.snapshot.favoritesCount && snapshotStore.snapshot.favoritesCount != 0">
 <dl>
        <dt>Favorites Count</dt>
        <dd>
        {{ snapshotStore.snapshot.favoritesCount }}
      </dd>
     </dl>
     </template>
      <template v-if="snapshotStore.snapshot.flagsCount && snapshotStore.snapshot.flagsCount != 0">
 <dl>
        <dt>Flags Count</dt>
        <dd>
        {{ snapshotStore.snapshot.flagsCount }}
      </dd>
     </dl>
     </template>
  </template>
  

  <template v-else>

    <PageStatusMessage 
    title="500: Unknown Error!"
    message="An unknown error occurred while retrieving the snapshot. Refresh page and try again.">
    </PageStatusMessage>

  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/description-list";
</style>