<script setup lang="ts">

// --- IMPORTS ---
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSnapshotStore } from '../stores/SnapshotStore';
import { useSnapshotListFilterStore } from '../stores/SnapshotListFilterStore'; 
import DisplayComponent from '@/components/DisplayTable.vue';
import InfiniteScroller from '@/components/InfiniteScroller.vue';
import PageStatusMessage from '@/components/PageMessageStatus.vue';
import { APIError } from '@/api/apiTypes';
import { useModalStore } from '@/stores/modalStore'
import { toShortDate } from '@/utils/dateExtensions'
import {ContentTypeDescriptions } from '@/utils/descriptors'

const props = defineProps<{
  payload: unknown // Arrives untouched as the raw string AccountId from your container
}>()

const contentid = computed(() => props.payload as string)

const snapshotStore = useSnapshotStore();
const snapshotFilterStore = useSnapshotListFilterStore();

const modalStore = useModalStore();

// --- Component Reactive State ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  
   // Build api path from a guarnateed clean filter store
  const cleanApiPath = snapshotFilterStore.buildModalApiPath(snapshotStore.baseRoute, contentid.value);

  // 3. Fetch from store
  const { success, error } = await snapshotStore.loadSnapshots(cleanApiPath)

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


// inside your HomeView.vue
onUnmounted(() => {
  snapshotStore.abort();
});


const openModal = (id: string) => {
  snapshotStore.viewedRows.add(id);
  modalStore.push('SnapshotDetail', 'Snapshot Details', id)
};

const handleKeyPress = (event: KeyboardEvent, item: any) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openModal(item.id);
  }
};

</script>

<template>

 <template v-if="isLoading">

   <div class="shared__page-title">
    <h1>Loading Snapshots... </h1>
      <p class="shared__loader"></p>
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

  <template v-else-if="!snapshotStore.snapshots || snapshotStore.snapshots.length === 0">

    <PageStatusMessage 
    title="No Content!"
    message="Sorry. No metrics was found for this content">
     
    </PageStatusMessage>

  </template>

  <template v-else>

      <InfiniteScroller
        :has-next="snapshotStore.hasNext"
        :is-fetching="snapshotStore.isFetchingMore"
        :error="snapshotStore.loadMoreError"
        @load-more="snapshotStore.loadMoreSnapshots"
        @retry="snapshotStore.loadMoreSnapshots">

      <DisplayComponent
        :items="snapshotStore.snapshots"
        :item-key="(item) => item.id"
        :is-row-highlighted="(item) => snapshotStore.viewedRows.has(item.id)"
        @row-click="(item: any) => openModal(item.id)"
        @row-key-down="handleKeyPress">

        <template #header>
             <th>Date</th>
              <th>Content</th>
              <th>Counts</th>
        </template>

        <template #row="{ item }">
          <td>{{ toShortDate(item.date) }}</td>
          <td>{{ ContentTypeDescriptions[item.contentType] }}</td>
           <td>{{ item.totalCount }}</td>
        </template>
      </DisplayComponent>
    </InfiniteScroller>
  </template>

</template>
