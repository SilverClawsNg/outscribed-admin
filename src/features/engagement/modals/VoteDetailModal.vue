<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PageMessageStatus from '@/components/PageMessageStatus.vue';
import { useVoteStore } from '../stores/VoteStore';
import { toLongDate } from '@/utils/dateExtensions'
import { APIError } from '@/api/apiTypes';
import { useRoute, useRouter } from 'vue-router';
import { useModalStore } from '@/stores/modalStore';
import { VoteTypeDescriptions, ContentTypeDescriptions } from '@/utils/descriptors'

const props = defineProps<{
  payload: unknown // Arrives untouched as the raw string AccountId from your container
}>()

const voteId = computed(() => props.payload as string)

const voteStore = useVoteStore();
const modalStore = useModalStore();

// --- Component Reactive State ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  // 3. Fetch from store
  const { success, error } = await voteStore.loadVote(voteId.value)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving vote. Refresh page and try again.'
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

   <div class="voted__page-title">
    <h1>Loading Votes... </h1>
      <p class="voted__loader"></p>
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
  <template v-else-if="voteStore.vote">
    
    <dl>
      <dt>Date</dt>
      <dd>{{ toLongDate(voteStore.vote.votedAt) }}</dd>
    </dl>

    <dl>
      <dt>User</dt>
      <dd>
        {{ voteStore.vote.username }}
        <button @click="modalStore.push('UserDetail', 'User Details', voteStore.vote.voterId)">
          View
        </button>
      </dd>
    </dl>

    <dl>
      <dt>Content Type</dt>
      <dd>
        {{ ContentTypeDescriptions[voteStore.vote.contentType] }}
       <template v-if="voteStore.vote.contentType === 'Tale'">
        <button @click="modalStore.push('TaleDetail', 'Tale Details', voteStore.vote.contentId)">
          View
        </button>
      </template>
      <template v-if="voteStore.vote.contentType === 'Insight'">
        <button @click="modalStore.push('InsightDetail', 'Insight Details', voteStore.vote.contentId)">
          View
        </button>
      </template>
       <template v-if="voteStore.vote.contentType === 'Comment'">
        <button @click="modalStore.push('CommentDetail', 'Comment Details', voteStore.vote.contentId)">
          View
        </button>
      </template>
      </dd>
     
    </dl>

    <dl>
         <dt>Vote Type</dt>
        <dd>
          {{ VoteTypeDescriptions[voteStore.vote.voteType] }}
      </dd>
    </dl>

  </template>

  <template v-else>

    <PageStatusMessage 
    title="500: Unknown Error!"
    message="An unknown error occurred while retrieving the vote. Refresh page and try again.">
    </PageStatusMessage>

  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/description-list";
</style>