<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PageMessageStatus from '@/components/PageMessageStatus.vue';
import { useAnalyticsStore } from '../stores/AnalyticsStore';
import { toLongDate } from '@/utils/dateExtensions'
import { APIError } from '@/api/apiTypes';
import { useRoute, useRouter } from 'vue-router';
import { useModalStore } from '@/stores/modalStore';

const props = defineProps<{
  payload: unknown // Arrives untouched as the raw string AccountId from your container
}>()

const analyticId = computed(() => props.payload as string)

const analyticsStore = useAnalyticsStore();
const modalStore = useModalStore();

// --- Component Reactive State ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)
const route = useRoute();
const router = useRouter();
const currentPath = encodeURIComponent(route.fullPath)

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  // 3. Fetch from store
  const { success, error } = await analyticsStore.loadAnalytic(analyticId.value)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving analytics. Refresh page and try again.'
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
    <h1>Loading Analytic... </h1>
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
  <template v-else-if="analyticsStore.analytic">
  
    <dl>
      <dt>Date</dt>
      <dd>{{ toLongDate(analyticsStore.analytic.date) }}</dd>
    </dl>
    
    <dl>
      <dt>Ip Address</dt>
      <dd>{{ analyticsStore.analytic.ipAddress }}</dd>
    </dl>

    <dl>
      <dt>User Agent</dt>
      <dd>{{ analyticsStore.analytic.userAgent }}</dd>
    </dl>
    
    <dl>
      <dt>Request Path</dt>
      <dd>{{ analyticsStore.analytic.requestPath }}</dd>
    </dl>

    <dl>
      <dt>Http Method</dt>
      <dd>{{ analyticsStore.analytic.httpMethod }}</dd>
    </dl>
    
    <dl>
      <dt>Processing Time</dt>
      <dd>{{ analyticsStore.analytic.elapsedMs }} ms</dd>
    </dl>
    
    <dl>
      <dt>Status Code</dt>
      <dd>{{ analyticsStore.analytic.statusCode }}</dd>
    </dl>
    
    <dl>
      <dt>Session Id</dt>
      <dd>{{ analyticsStore.analytic.sessionId }}</dd>
    </dl>
    
    <dl>
      <dt>Continent</dt>
      <dd>{{ analyticsStore.analytic.continent }}</dd>
    </dl>
    
    <dl>
      <dt>Country</dt>
      <dd>{{ analyticsStore.analytic.country }}</dd>
    </dl>

    <dl>
      <dt>Region</dt>
      <dd>{{ analyticsStore.analytic.region }}</dd>
    </dl>

    <dl>
      <dt>City</dt>
      <dd>{{ analyticsStore.analytic.city }}</dd>
    </dl>

<template v-if="analyticsStore.analytic.username">

    <dl>
      <dt>User</dt>
      <dd>
        {{ analyticsStore.analytic.username }}
        <button @click="modalStore.push('UserDetail', 'User Details', analyticsStore.analytic.userId)">
          View
        </button>
      </dd>
    </dl>
    
  </template>

  </template>

  <template v-else>

    <PageStatusMessage 
    title="500: Unknown Error!"
    message="An unknown error occurred while retrieving the analytic. Refresh page and try again.">
    </PageStatusMessage>

  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/description-list";
</style>