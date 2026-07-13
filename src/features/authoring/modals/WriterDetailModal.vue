<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PageMessageStatus from '@/components/PageMessageStatus.vue';
import { useWriterStore } from '../stores/WriterStore';
import { toLongDate } from '@/utils/dateExtensions'
import { APIError } from '@/api/apiTypes';
import { useModalStore } from '@/stores/modalStore';
import { CountryDescriptions, WriterStatusDescriptions } from '@/utils/descriptors'

const props = defineProps<{
  payload: unknown // Arrives untouched as the raw string AccountId from your container
}>()

const writerId = computed(() => props.payload as string)

const writerStore = useWriterStore();
const modalStore = useModalStore();

// --- Component Reactive State ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  // 3. Fetch from store
  const { success, error } = await writerStore.loadWriter(writerId.value)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving writers. Refresh page and try again.'
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

   <div class="shared__page-title">
    <h1>Loading Writer... </h1>
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

  <!-- Core Body View Template -->
  <template v-else-if="writerStore.writer">

    <div class="btn-group">

      <template v-if="writerStore.writer.status === 'Active'">
        <button 
          class="btn primary" 
          @click="modalStore.push('SuspendWriter', 'Suspend Writer', writerStore.writer.writerId)"
        >
          Suspend
        </button>

      </template>

      <template v-if="writerStore.writer.status === 'Suspended'">
        <button 
          class="btn primary" 
          @click="modalStore.push('ReinstateWriter', 'Reinstate Writer', writerStore.writer.writerId)"
        >
          Reinstate
        </button>

      </template>
    

    </div>

    <dl>
      <dt>Date</dt>
      <dd>{{ toLongDate(writerStore.writer.onboardedAt) }}</dd>
    </dl>

    <dl>
      <dt>User</dt>
      <dd>
        {{ writerStore.writer.username }}
        <button @click="modalStore.push('UserDetail', 'User Details', writerStore.writer.writerId)">
          View
        </button>
      </dd>
    </dl>
    
    <dl>
      <dt>Status</dt>
      <dd>{{ WriterStatusDescriptions[writerStore.writer.status] }}</dd>
    </dl>

   <dl>
      <dt>Country</dt>
      <dd>
        {{ CountryDescriptions[writerStore.writer.country] }}
      </dd>
    </dl>

  </template>

 <template v-else>

    <PageStatusMessage 
    title="500: Unknown Error!"
    message="An unknown error occurred while retrieving the writer. Refresh page and try again.">
    </PageStatusMessage>

  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/description-list";
</style>