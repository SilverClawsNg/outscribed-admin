<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PageMessageStatus from '@/components/PageMessageStatus.vue';
import { useLogStore } from '../stores/LogStore';
import { toLongDate } from '@/utils/dateExtensions'
import { APIError } from '@/api/apiTypes';
import { useRoute, useRouter } from 'vue-router';
import { useModalStore } from '@/stores/modalStore';

const props = defineProps<{
  payload: unknown // Arrives untouched as the raw string AccountId from your container
}>()

const logId = computed(() => props.payload as string)

const logStore = useLogStore();
const modalStore = useModalStore();

// --- Component Reactive State ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  // 3. Fetch from store
  const { success, error } = await logStore.loadLog(logId.value)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving logs. Refresh page and try again.'
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


const formatKey = (key: string): string => {
  return key.replace(/([A-Z])/g, ' $1').trim() // e.g. "SourceContext" → "Source Context"
}

const formatValue = (value: any): string => {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

</script>

<template>
 
 <template v-if="isLoading">

   <div class="shared__page-title">
    <h1>Loading Logs... </h1>
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
  <template v-else-if="logStore.log">

    <dl>
      <dt>Date</dt>
      <dd>{{ toLongDate(logStore.log.date) }}</dd>
    </dl>

    <dl>
      <dt>Level</dt>
      <dd>{{ logStore.log.level }}</dd>
    </dl>

    <dl>
      <dt>Message</dt>
      <dd>{{ logStore.log.message }}</dd>
    </dl>

   <template v-if="logStore.log.properties">
 <h3 class="modal-page-heading">
      Properties
    </h3>

   <template v-for="(value, key) in logStore.log.properties" :key="key" class="property-row">
             <dl>
               <dt>{{ key }}</dt>
              <dd>{{ formatValue(value) }}</dd>
             </dl>
            </template>

     
    </template>

  </template>

<template v-else>

    <PageStatusMessage 
    title="500: Unknown Error!"
    message="An unknown error occurred while retrieving the log. Refresh page and try again.">
    </PageStatusMessage>

  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/description-list";
</style>