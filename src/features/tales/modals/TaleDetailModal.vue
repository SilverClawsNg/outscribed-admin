<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PageMessageStatus from '@/components/PageMessageStatus.vue';
import { useTaleStore } from '../stores/TaleStore';
import { type TaleDetailDto } from '../types/TaleTypes';
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

const taleId = computed(() => props.payload as string)

const taleStore = useTaleStore();
const modalStore = useModalStore();

// --- Component Reactive State ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  // 3. Fetch from store
  const { success, error } = await taleStore.loadTale(taleId.value)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving tales. Refresh page and try again.'
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
    <h1>Loading Tales... </h1>
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
  <template v-else-if="taleStore.tale">
    <div class="btn-group">
      <template v-if="taleStore.tale.status !== 'ArchivedByAdmin'">
        <button 
          class="btn primary" 
          @click="modalStore.push('ArchiveTale', 'Archive Tale', taleStore.tale.taleId)"
        >
          Archive
        </button>

        <template v-if="
          taleStore.tale.status !== 'LaunchedToArchivedByCreator' && 
          taleStore.tale.status !== 'CertifiedToArchivedByCreator'
        ">
          <button 
            v-if="taleStore.tale.status !== 'HiddenByAdmin' && taleStore.tale.status !== 'HiddenByModeration'"
            class="btn primary" 
            @click="modalStore.push('HideTale', 'Hide Tale', taleStore.tale.taleId)"
          >
            Hide
          </button>
          
          <button 
            v-else 
            class="btn primary" 
            @click="modalStore.push('CertifyTale', 'Certify Tale', taleStore.tale.taleId)"
          >
            Certify
          </button>
        </template>
      </template>
       <button 
            class="btn secondary" 
            @click="modalStore.push('SnapshotList', 'Tale Metrics', taleStore.tale.taleId)"
          >
            Metrics
          </button>
       
    </div>

    <dl>
      <dt>Date</dt>
      <dd>{{ toLongDate(taleStore.tale.createdAt) }}</dd>
    </dl>

    <dl>
      <dt>Title</dt>
      <dd>{{ taleStore.tale.title }}</dd>
    </dl>

    <dl>
      <dt>User</dt>
      <dd>
        {{ taleStore.tale.username }}
        <button @click="modalStore.push('UserDetail', 'User Details', taleStore.tale.creatorId)">
          View
        </button>
      </dd>
    </dl>

    <template v-if="taleStore.tale.country">

    <dl>
      <dt>Country</dt>
      <dd>
        {{ CountryDescriptions[taleStore.tale.country] }}
      </dd>
    </dl>

    </template>

    <dl>
      <dt>Category</dt>
      <dd>{{ CategoryDescriptions[taleStore.tale.category] }}</dd>
    </dl>

    <dl>
      <dt>Status</dt>
      <dd>{{ taleStore.tale.status }}</dd>
    </dl>

    <dl>
      <dt>Summary</dt>
      <dd v-if="taleStore.tale.summary === null" class="no-content">
        No summary found!
      </dd>
      <dd v-else>
        {{ taleStore.tale.summary }}
      </dd>
    </dl>

    <dl>
      <dt>Detail</dt>
      <dd v-html="sanitizeHtml(taleStore.tale.detail)"></dd>
    </dl>

    <!-- Watchlist Supplemental Panel Grid -->
    <template v-if="taleStore.tale.watchlistTitle !== null">
      <h3 class="modal-page-heading">
        Watchlist
      </h3>
      <dl>
        <dt>Title</dt>
        <dd>{{ taleStore.tale.watchlistTitle }}</dd>
      </dl>
      <dl>
        <dt>Summary</dt>
        <dd>{{ taleStore.tale.watchlistSummary }}</dd>
      </dl>
      <dl>
        <dt>Source</dt>
        <dd>{{ taleStore.tale.watchlistSource }}</dd>
      </dl>
      <dl>
        <dt>Url</dt>
        <dd>{{ taleStore.tale.watchlistUrl }}</dd>
      </dl>
    </template>

     <template v-if="taleStore.tale.addendum">
       <dt>Addendum</dt>
        <dd>
         <ol>
          <li v-for="(addendum, index) in formatAddendum(taleStore.tale.addendum)" :key="index">
            {{ addendum }}
          </li>
        </ol>
      </dd>
      </template>
     
    <dl>
      <dt>Photo</dt>
      <dd v-if="taleStore.tale.photo !== null">
       <img  :src="mediaHelper.getUrl(taleStore.tale.photo, 'tales', 'full') || undefined" :alt="taleStore.tale.photoCaption" />
      </dd>
      <dd v-else class="no-content">
        No photo found!
      </dd>
    </dl>

    <dl>
      <dt>Photo caption</dt>
      <dd v-if="taleStore.tale.photoCaption === null" class="no-content">
        No caption found!
      </dd>
      <dd v-else>
        {{ taleStore.tale.photoCaption }}
      </dd>
    </dl>

    <h3 class="modal-page-heading">
      Statistics
    </h3>

    <dl>
      <dt>Reading Time</dt>
      <dd>{{ taleStore.tale.readingTime }}</dd>
    </dl>
    <dl>
      <dt>Anonymous Views</dt>
      <dd>{{ formatCounts(taleStore.tale.viewsCount) }}</dd>
    </dl>
    <dl>
      <dt>Authenticated Views</dt>
      <dd>{{ formatCounts(taleStore.tale.authViewsCount) }}</dd>
    </dl>
    <dl>
      <dt>Insights</dt>
      <dd>{{ formatCounts(taleStore.tale.insightsCount) }}</dd>
    </dl>
    <dl>
      <dt>Comments</dt>
      <dd>{{ formatCounts(taleStore.tale.commentsCount) }}</dd>
    </dl>
    <dl>
      <dt>Replies</dt>
      <dd>{{ formatCounts(taleStore.tale.repliesCount) }}</dd>
    </dl>
    <dl>
      <dt>Flags</dt>
      <dd>{{ formatCounts(taleStore.tale.flagsCount) }}</dd>
    </dl>
    <dl>
      <dt>Shares</dt>
      <dd>{{ formatCounts(taleStore.tale.sharesCount) }}</dd>
    </dl>
    <dl>
      <dt>Favorites</dt>
      <dd>{{ formatCounts(taleStore.tale.favoritesCount) }}</dd>
    </dl>
    <dl>
      <dt>Upvotes</dt>
      <dd>{{ formatCounts(taleStore.tale.upvotesCount) }}</dd>
    </dl>
    <dl>
      <dt>Downvotes</dt>
      <dd>{{ formatCounts(taleStore.tale.downvotesCount) }}</dd>
    </dl>
    <dl>
      <dt>Engagement Score</dt>
      <dd>{{ taleStore.tale.engagementScore }}</dd>
    </dl>

    <dl v-if="taleStore.tale.tags !== null && taleStore.tale.tags.length > 0">
      <dt>Tags</dt>
      <dd>
        <ul>
          <li v-for="(tag, index) in taleStore.tale.tags" :key="index">
            {{ tag.name }}
          </li>
        </ul>
      </dd>
    </dl>
  </template>

<template v-else>

    <PageStatusMessage 
    title="500: Unknown Error!"
    message="An unknown error occurred while retrieving the tale. Refresh page and try again.">
    </PageStatusMessage>

  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/description-list";
</style>