<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PageMessageStatus from '@/components/PageMessageStatus.vue';
import { useFlagStore } from '../stores/FlagStore';
import { toLongDate } from '@/utils/dateExtensions'
import { APIError } from '@/api/apiTypes';
import { useRoute, useRouter } from 'vue-router';
import { useModalStore } from '@/stores/modalStore';
import { FlagTypeDescriptions, ContentTypeDescriptions } from '@/utils/descriptors'

const props = defineProps<{
  payload: unknown // Arrives untouched as the raw string AccountId from your container
}>()

const flagId = computed(() => props.payload as string)

const flagStore = useFlagStore();
const modalStore = useModalStore();

// --- Component Reactive State ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  // 3. Fetch from store
  const { success, error } = await flagStore.loadFlag(flagId.value)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving flags. Refresh page and try again.'
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
    <h1>Loading Flags... </h1>
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
  <template v-else-if="flagStore.flag">
    
    <dl>
      <dt>Date</dt>
      <dd>{{ toLongDate(flagStore.flag.flaggedAt) }}</dd>
    </dl>

    <dl>
      <dt>User</dt>
      <dd>
        {{ flagStore.flag.username }}
        <button @click="modalStore.push('UserDetail', 'User Details', flagStore.flag.flaggerId)">
          View
        </button>
      </dd>
    </dl>

    <dl>
      <dt>Type</dt>
      <dd>{{ FlagTypeDescriptions[flagStore.flag.flagType] }}</dd>
    </dl>

    <dl>
      <dt>Content Type</dt>
      <dd>
        {{ ContentTypeDescriptions[flagStore.flag.contentType] }}
       <template v-if="flagStore.flag.contentType === 'Tale'">
        <button @click="modalStore.push('TaleDetail', 'Tale Details', flagStore.flag.contentId)">
          View
        </button>
      </template>
      <template v-if="flagStore.flag.contentType === 'Insight'">
        <button @click="modalStore.push('InsightDetail', 'Insight Details', flagStore.flag.contentId)">
          View
        </button>
      </template>
       <template v-if="flagStore.flag.contentType === 'Comment'">
        <button @click="modalStore.push('CommentDetail', 'Comment Details', flagStore.flag.contentId)">
          View
        </button>
      </template>
      </dd>
     
    </dl>

      <template v-if="flagStore.flag.notes">
    <dl>
         <dt>Notes</dt>
        <dd>
        {{ flagStore.flag.notes }}
      </dd>
    </dl>
      </template>

  </template>

  <template v-else>

    <PageStatusMessage 
    title="500: Unknown Error!"
    message="An unknown error occurred while retrieving the flag. Refresh page and try again.">
    </PageStatusMessage>

  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/description-list";
</style>