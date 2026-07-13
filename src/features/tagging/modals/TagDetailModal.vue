<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PageMessageStatus from '@/components/PageMessageStatus.vue';
import { useTagStore } from '../stores/TagStore';
import { toLongDate } from '@/utils/dateExtensions'
import { APIError } from '@/api/apiTypes';
import { useRoute, useRouter } from 'vue-router';
import { useModalStore } from '@/stores/modalStore';

const props = defineProps<{
  payload: unknown // Arrives untouched as the raw string AccountId from your container
}>()

const tagId = computed(() => props.payload as string)

const tagStore = useTagStore();
const modalStore = useModalStore();

// --- Component Reactive State ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  // 3. Fetch from store
  const { success, error } = await tagStore.loadTag(tagId.value)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving tags. Refresh page and try again.'
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
    <h1>Loading Tags... </h1>
      <p class="shared__loader"></p>
    </div>

  </template>

 <template v-else-if="loadingError">

    <PageMessageStatus 
      :title="loadingError.title || 'Error Loading Lists'" 
      :message="loadingError.detail || 'An unexpected error occurred.'">
        <template v-if="loadingError.status == 401" #actions>
        <button class="btn primary" @click="modalStore.push('Register', 'Register')">Tagin</button>
      </template>
    </PageMessageStatus>

  </template>

  <!-- Core Body View Template -->
  <template v-else-if="tagStore.tag">

    <dl>
      <dt>Date</dt>
      <dd>{{ toLongDate(tagStore.tag.createdAt) }}</dd>
    </dl>

     <dl>
      <dt>Last Updated</dt>
      <dd>{{ toLongDate(tagStore.tag.lastUpdatedAt) }}</dd>
    </dl>

    <dl>
      <dt>Name</dt>
      <dd>{{ tagStore.tag.name }}</dd>
    </dl>

    <dl>
      <dt>Slug</dt>
      <dd>{{ tagStore.tag.slug }}</dd>
    </dl>

    <h3 class="modal-page-heading">
      Statistics
    </h3>

    <dl>
      <dt>Insights</dt>
      <dd>{{ tagStore.tag.insightsCounter }}</dd>
    </dl>
    <dl>
      <dt>Tale</dt>
      <dd>{{ tagStore.tag.talesCounter }}</dd>
    </dl>
   
  </template>

<template v-else>

    <PageStatusMessage 
    title="500: Unknown Error!"
    message="An unknown error occurred while retrieving the tag. Refresh page and try again.">
    </PageStatusMessage>

  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/description-list";
</style>