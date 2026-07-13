<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PageMessageStatus from '@/components/PageMessageStatus.vue';
import { useShareStore } from '../stores/ShareStore';
import { toLongDate } from '@/utils/dateExtensions'
import { APIError } from '@/api/apiTypes';
import { useRoute, useRouter } from 'vue-router';
import { useModalStore } from '@/stores/modalStore';
import { ContactTypeDescriptions, ContentTypeDescriptions } from '@/utils/descriptors'

const props = defineProps<{
  payload: unknown // Arrives untouched as the raw string AccountId from your container
}>()

const shareId = computed(() => props.payload as string)

const shareStore = useShareStore();
const modalStore = useModalStore();

// --- Component Reactive State ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  // 3. Fetch from store
  const { success, error } = await shareStore.loadShare(shareId.value)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving shares. Refresh page and try again.'
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
    <h1>Loading Shares... </h1>
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
  <template v-else-if="shareStore.share">
    
    <dl>
      <dt>Date</dt>
      <dd>{{ toLongDate(shareStore.share.sharedAt) }}</dd>
    </dl>

    <template  v-if="shareStore.share.username !== null">

    <dl>
      <dt>User</dt>
      <dd>
        {{ shareStore.share.username }}
        <button @click="modalStore.push('UserDetail', 'User Details', shareStore.share.sharerId)">
          View
        </button>
      </dd>
    </dl>

    </template>

    <dl>
      <dt>Contact</dt>
      <dd>{{ ContactTypeDescriptions[shareStore.share.contactType] }}</dd>
    </dl>

    <dl>
      <dt>Content Type</dt>
      <dd>
        {{ ContentTypeDescriptions[shareStore.share.contentType] }}
       <template v-if="shareStore.share.contentType === 'Tale'">
        <button @click="modalStore.push('TaleDetail', 'Tale Details', shareStore.share.contentId)">
          View
        </button>
      </template>
      <template v-if="shareStore.share.contentType === 'Insight'">
        <button @click="modalStore.push('InsightDetail', 'Insight Details', shareStore.share.contentId)">
          View
        </button>
      </template>
    
      </dd>
     
    </dl>

       <dt>Handle</dt>
        <dd>
        {{ shareStore.share.handle }}
      </dd>

  </template>

  <template v-else>

    <PageStatusMessage 
    title="500: Unknown Error!"
    message="An unknown error occurred while retrieving the share. Refresh page and try again.">
    </PageStatusMessage>

  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/description-list";
</style>