<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PageMessageStatus from '@/components/PageMessageStatus.vue';
import { useInsightStore } from '../stores/InsightStore';
import { type InsightDetailDto } from '../types/InsightTypes';
import { sanitizeHtml } from '@/utils/markupHelper';
import { formatAddendum, formatCounts } from '@/utils/stringHelpers'
import { toLongDate } from '@/utils/dateExtensions'
import { APIError } from '@/api/apiTypes';
import { useRoute, useRouter } from 'vue-router';
import { useModalStore } from '@/stores/modalStore';
import { mediaHelper } from '@/utils/mediaHelper'
import { CategoryDescriptions, CountryDescriptions } from '@/utils/descriptors'

const props = defineProps<{
  payload: unknown // Arrives untouched as the raw string AccountId from your container
}>()

const insightId = computed(() => props.payload as string)

const insightStore = useInsightStore();
const modalStore = useModalStore();

// --- Component Reactive State ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  // 3. Fetch from store
  const { success, error } = await insightStore.loadInsight(insightId.value)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving insights. Refresh page and try again.'
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
    <h1>Loading Insights... </h1>
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
  <template v-else-if="insightStore.insight">

    <div class="btn-group">
      <template v-if="insightStore.insight.status !== 'ArchivedByAdmin'">
        <button 
          class="btn primary" 
          @click="modalStore.push('ArchiveInsight', 'Archive Insight', insightStore.insight.insightId)"
        >
          Archive
        </button>

        <template v-if="
          insightStore.insight.status !== 'LaunchedToArchivedByCreator' && 
          insightStore.insight.status !== 'CertifiedToArchivedByCreator'
        ">
          <button 
            v-if="insightStore.insight.status !== 'HiddenByAdmin' && insightStore.insight.status !== 'HiddenByModeration'"
            class="btn primary" 
            @click="modalStore.push('HideInsight', 'Hide Insight', insightStore.insight.insightId)"
          >
            Hide
          </button>
          
          <button 
            v-else 
            class="btn primary" 
            @click="modalStore.push('CertifyInsight', 'Certify Insight', insightStore.insight.insightId)"
          >
            Certify
          </button>
        </template>
      </template>
       <button 
            class="btn secondary" 
            @click="modalStore.push('SnapshotList', 'Tale Metrics', insightStore.insight.insightId)"
          >
            Metrics
          </button>
     
    </div>

    <dl>
      <dt>Date</dt>
      <dd>{{ toLongDate(insightStore.insight.createdAt) }}</dd>
    </dl>

    <dl>
      <dt>Title</dt>
      <dd>{{ insightStore.insight.title }}</dd>
    </dl>

    <dl>
      <dt>User</dt>
      <dd>
        {{ insightStore.insight.username }}
        <button @click="modalStore.push('UserDetail', 'User Details', insightStore.insight.creatorId)">
          View
        </button>
      </dd>
    </dl>

    <template v-if="insightStore.insight.country">

    <dl>
      <dt>Country</dt>
      <dd>
        {{ CountryDescriptions[insightStore.insight.country] }}
      </dd>
    </dl>

    </template>

    <dl>
      <dt>Category</dt>
      <dd>{{ CategoryDescriptions[insightStore.insight.category] }}</dd>
    </dl>

    <dl>
      <dt>Status</dt>
      <dd>{{ insightStore.insight.status }}</dd>
    </dl>

    <dl>
      <dt>Summary</dt>
      <dd v-if="insightStore.insight.summary === null" class="no-content">
        No summary found!
      </dd>
      <dd v-else>
        {{ insightStore.insight.summary }}
      </dd>
    </dl>

     <dl>
      <dt>Detail</dt>
      <dd v-html="sanitizeHtml(insightStore.insight.detail)"></dd>
    </dl>

     <template v-if="insightStore.insight.addendum">
       <dt>Addendum</dt>
        <dd>
         <ol>
          <li v-for="(addendum, index) in formatAddendum(insightStore.insight.addendum)" :key="index">
            {{ addendum }}
          </li>
        </ol>
      </dd>
      </template>

    <dl>
      <dt>Photo</dt>
      <dd v-if="insightStore.insight.photo !== null">
       <img  :src="mediaHelper.getUrl(insightStore.insight.photo, 'insights', 'full') || undefined" :alt="insightStore.insight.photoCaption" />
      </dd>
      <dd v-else class="no-content">
        No photo found!
      </dd>
    </dl>

    <dl>
      <dt>Photo caption</dt>
      <dd v-if="insightStore.insight.photoCaption === null" class="no-content">
        No caption found!
      </dd>
      <dd v-else>
        {{ insightStore.insight.photoCaption }}
      </dd>
    </dl>

    <h3 class="modal-page-heading">
      Statistics
    </h3>

    <dl>
      <dt>Reading Time</dt>
      <dd>{{ insightStore.insight.readingTime }}</dd>
    </dl>
    <dl>
      <dt>Anonymous Views</dt>
      <dd>{{ formatCounts(insightStore.insight.viewsCount) }}</dd>
    </dl>
    <dl>
      <dt>Authenticated Views</dt>
      <dd>{{ formatCounts(insightStore.insight.authViewsCount) }}</dd>
    </dl>
   
    <dl>
      <dt>Comments</dt>
      <dd>{{ formatCounts(insightStore.insight.commentsCount) }}</dd>
    </dl>
    <dl>
      <dt>Replies</dt>
      <dd>{{ formatCounts(insightStore.insight.repliesCount) }}</dd>
    </dl>
    <dl>
      <dt>Flags</dt>
      <dd>{{ formatCounts(insightStore.insight.flagsCount) }}</dd>
    </dl>
    <dl>
      <dt>Shares</dt>
      <dd>{{ formatCounts(insightStore.insight.sharesCount) }}</dd>
    </dl>
    <dl>
      <dt>Favorites</dt>
      <dd>{{ formatCounts(insightStore.insight.favoritesCount) }}</dd>
    </dl>
    <dl>
      <dt>Upvotes</dt>
      <dd>{{ formatCounts(insightStore.insight.upvotesCount) }}</dd>
    </dl>
    <dl>
      <dt>Downvotes</dt>
      <dd>{{ formatCounts(insightStore.insight.downvotesCount) }}</dd>
    </dl>
    <dl>
      <dt>Engagement Score</dt>
      <dd>{{ insightStore.insight.engagementScore }}</dd>
    </dl>

    <dl v-if="insightStore.insight.tags !== null && insightStore.insight.tags.length > 0">
      <dt>Tags</dt>
      <dd>
        <ul>
          <li v-for="(tag, index) in insightStore.insight.tags" :key="index">
            {{ tag.name }}
          </li>
        </ul>
      </dd>
    </dl>
  </template>

<template v-else>

    <PageStatusMessage 
    title="500: Unknown Error!"
    message="An unknown error occurred while retrieving the insight. Refresh page and try again.">
    </PageStatusMessage>

  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/description-list";
</style>