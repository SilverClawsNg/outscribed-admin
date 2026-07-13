<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PageMessageStatus from '@/components/PageMessageStatus.vue';
import { useFaqStore } from '../stores/FaqStore';
import { sanitizeHtml } from '@/utils/markupHelper';
import { formatCounts } from '@/utils/stringHelpers'
import { toLongDate } from '@/utils/dateExtensions'
import { APIError } from '@/api/apiTypes';
import { useRoute, useRouter } from 'vue-router';
import { useModalStore } from '@/stores/modalStore';

const props = defineProps<{
  payload: unknown // Arrives untouched as the raw string AccountId from your container
}>()

const faqId = computed(() => props.payload as string)

const faqStore = useFaqStore();
const modalStore = useModalStore();

// --- Component Reactive State ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  // 3. Fetch from store
  const { success, error } = await faqStore.loadFaq(faqId.value)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving faq. Refresh page and try again.'
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
    <h1>Loading Faqs... </h1>
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
  <template v-else-if="faqStore.faq">

    <div class="btn-group">
         <button 
          class="btn primary" 
          @click="modalStore.push('UpdateFaq', 'Update Faq', faqStore.faq.faqId)"
        >
          Update
        </button>
    
    </div>

    <dl>
      <dt>Date</dt>
      <dd>{{ toLongDate(faqStore.faq.createdAt) }}</dd>
    </dl>

     <dl>
      <dt>Last Updated</dt>
      <dd>{{ toLongDate(faqStore.faq.lastUpdatedAt) }}</dd>
    </dl>

    <dl>
      <dt>Question</dt>
      <dd>{{ faqStore.faq.question }}</dd>
    </dl>

     <dl>
      <dt>Answer</dt>
            <dd class="rich__text" v-html="sanitizeHtml(faqStore.faq.answer)"></dd>
    </dl>

    <dl>
      <dt>Updated By</dt>
      <dd>
        {{ faqStore.faq.updater.username }}
        <button @click="modalStore.push('UserDetail', 'User Details', faqStore.faq.updater.adminId)">
          View
        </button>
      </dd>
    </dl>

    <h3 class="modal-page-heading">
      Statistics
    </h3>

    <dl>
      <dt>Upvotes</dt>
      <dd>{{ formatCounts(faqStore.faq.upvotes) }}</dd>
    </dl>
    <dl>
      <dt>Downvotes</dt>
      <dd>{{ formatCounts(faqStore.faq.downvotes) }}</dd>
    </dl>
  
  </template>

<template v-else>

    <PageStatusMessage 
    title="500: Unknown Error!"
    message="An unknown error occurred while retrieving the faq. Refresh page and try again.">
    </PageStatusMessage>

  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/description-list";

</style>