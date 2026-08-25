<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PageMessageStatus from '@/components/PageMessageStatus.vue';
import { useVerificationStore } from '../stores/VerificationStore';
import { toLongDate } from '@/utils/dateExtensions'
import { APIError } from '@/api/apiTypes';
import { useRoute, useRouter } from 'vue-router';
import { useModalStore } from '@/stores/modalStore';


const props = defineProps<{
  payload: unknown // Arrives untouched as the raw string AccountId from your container
}>()

const authenticationId = computed(() => props.payload as string)

const verificationStore = useVerificationStore();
const modalStore = useModalStore();

// --- Component Reactive State ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)


// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  // 3. Fetch from store
  const { success, error } = await verificationStore.loadVerification(authenticationId.value)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving verifications. Refresh page and try again.'
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
    <h1>Loading Verifications... </h1>
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
  <template v-else-if="verificationStore.verification">

    <dl>
      <dt>Date</dt>
      <dd>{{ toLongDate(verificationStore.verification.createdAt) }}</dd>
    </dl>

    <dl>
      <dt>Last Updated</dt>
      <dd>{{ toLongDate(verificationStore.verification.lastUpdatedAt) }}</dd>
    </dl>


    <dl>
      <dt>Email Address</dt>
      <dd>
        {{ verificationStore.verification.emailAddress }}
      </dd>
    </dl>

    <dl>
      <dt>Is Registered?</dt>
      <dd>{{ verificationStore.verification.isRegistered }}</dd>
    </dl>

    <dl>
      <dt>Is Abandoned?</dt>
      <dd>{{ verificationStore.verification.isAbandoned }}</dd>
    </dl>

      <dl>
      <dt>Total Resends</dt>
      <dd>{{ verificationStore.verification.totalResendsCounter }}</dd>
    </dl>

       <dl>
      <dt>Total Attempts</dt>
      <dd>{{ verificationStore.verification.totalAttemptsCounter }}</dd>
    </dl>

  </template>
</template>

<style lang="less" scoped>
@import "@/assets/css/description-list";
</style>