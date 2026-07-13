<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PageMessageStatus from '@/components/PageMessageStatus.vue';
import { useInquiryStore } from '../stores/InquiryStore';
import { sanitizeHtml } from '@/utils/markupHelper';
import { toLongDate } from '@/utils/dateExtensions'
import { APIError } from '@/api/apiTypes';
import { useRoute, useRouter } from 'vue-router';
import { useModalStore } from '@/stores/modalStore';
import { InquiryStatusDescriptions } from '@/utils/descriptors'

const props = defineProps<{
  payload: unknown // Arrives untouched as the raw string AccountId from your container
}>()

const inquiryId = computed(() => props.payload as string)

const inquiryStore = useInquiryStore();
const modalStore = useModalStore();

// --- Component Reactive State ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  // 3. Fetch from store
  const { success, error } = await inquiryStore.loadInquiry(inquiryId.value)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving inquiry. Refresh page and try again.'
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
    <h1>Loading Inquiry... </h1>
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
  <template v-else-if="inquiryStore.inquiry">

    <template v-if="inquiryStore.inquiry.status == 'Open'">

    <div class="btn-group">
         <button 
          class="btn primary" 
          @click="modalStore.push('AnswerInquiry', 'Answer Inquiry', inquiryStore.inquiry.inquiryId)"
        >
          Answer
        </button>
    
    </div>
</template>


    <dl>
      <dt>Date</dt>
      <dd>{{ toLongDate(inquiryStore.inquiry.askedAt) }}</dd>
    </dl>

    <dl>
      <dt>Question</dt>
      <dd>{{ inquiryStore.inquiry.question }}</dd>
    </dl>

      <dl>
      <dt>Status</dt>
      <dd>{{ InquiryStatusDescriptions[inquiryStore.inquiry.status] }}</dd>
    </dl>

    <template v-if="inquiryStore.inquiry.status == 'Resolved'">
      
     <dl>
      <dt>Answered</dt>
      <dd>{{ toLongDate(inquiryStore.inquiry.answeredAt) }}</dd>
    </dl>

     <dl>
      <dt>Answer</dt>
            <dd class="rich__text" v-html="sanitizeHtml(inquiryStore.inquiry.answer)"></dd>
    </dl>
    
    <dl>
      <dt>Updated By</dt>
      <dd>
        {{ inquiryStore.inquiry.updater.username }}
        <button @click="modalStore.push('UserDetail', 'User Details', inquiryStore.inquiry.updater.adminId)">
          View
        </button>
      </dd>
    </dl>

 
  </template>
  </template>

  <template v-else>

    <PageStatusMessage 
    title="500: Unknown Error!"
    message="An unknown error occurred while retrieving the inquiry. Refresh page and try again.">
    </PageStatusMessage>

  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/description-list";

</style>