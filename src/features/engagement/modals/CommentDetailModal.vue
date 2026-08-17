<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PageMessageStatus from '@/components/PageMessageStatus.vue';
import { useCommentStore } from '../stores/CommentStore';
import { sanitizeHtml } from '@/utils/markupHelper';
import { formatAddendum, formatCounts } from '@/utils/stringHelpers'
import { toLongDate } from '@/utils/dateExtensions'
import { APIError } from '@/api/apiTypes';
import { useRoute, useRouter } from 'vue-router';
import { useModalStore } from '@/stores/modalStore';
import { CommentStatusDescriptions, ContentTypeDescriptions } from '@/utils/descriptors'
import type {CommentDetailDto} from '../types/EngagementTypes'

const props = defineProps<{
  payload: unknown // Arrives untouched as the raw string AccountId from your container
}>()

const commentId = computed(() => props.payload as string)
  const localComment = ref<CommentDetailDto | null>(null);

const commentStore = useCommentStore();
const modalStore = useModalStore();

// --- Component Reactive State ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)


// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  // 3. Fetch from store
  const { success, error, comment } = await commentStore.loadComment(commentId.value)

  if (!success) {
    loadingError.value = error ?? new APIError(500, 'Unknwon Error', 'Unknown error occured while retrieving comments. Refresh page and try again.')
    return
  }

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving comments. Refresh page and try again.'
      );
  }
  }

  localComment.value = comment
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
    <h1>Loading Comments... </h1>
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
  <template v-else-if="localComment">
    <div class="btn-group">
      <template v-if="localComment.status !== 'ArchivedByAdmin'">
        <button 
          class="btn primary" 
          @click="modalStore.push('ArchiveComment', 'Archive Comment', localComment.commentId)"
        >
          Archive
        </button>

        <template v-if="
          localComment.status !== 'ActiveToArchivedByCreator' && 
          localComment.status !== 'CertifiedToArchivedByCreator'
        ">
          <button 
            v-if="localComment.status !== 'HiddenByAdmin' && localComment.status !== 'HiddenByModeration'"
            class="btn primary" 
            @click="modalStore.push('HideComment', 'Hide Comment', localComment.commentId)"
          >
            Hide
          </button>
          
          <button 
            v-else 
            class="btn primary" 
            @click="modalStore.push('CertifyComment', 'Certify Comment', localComment.commentId)"
          >
            Certify
          </button>
        </template>
      </template>
        <button 
            class="btn secondary" 
            @click="modalStore.push('SnapshotList', 'Tale Metrics', localComment.commentId)"
          >
            Metrics
          </button>
    </div>

    <dl>
      <dt>Date</dt>
      <dd>{{ toLongDate(localComment.commentedAt) }}</dd>
    </dl>

    <dl>
      <dt>User</dt>
      <dd>
        {{ localComment.username }}
        <button @click="modalStore.push('UserDetail', 'User Details', localComment.commentatorId)">
          View
        </button>
      </dd>
    </dl>

    <dl>
      <dt>Status</dt>
      <dd>{{ CommentStatusDescriptions[localComment.status] }}</dd>
    </dl>

    <dl>
      <dt>Content Type</dt>
      <dd>{{ ContentTypeDescriptions[localComment.contentType] }}
    <template v-if="localComment.contentType === 'Tale'">
        <button @click="modalStore.push('TaleDetail', 'Tale Details', localComment.contentId)">
          View
        </button>
      </template>
      <template v-if="localComment.contentType === 'Insight'">
        <button @click="modalStore.push('InsightDetail', 'Insight Details', localComment.contentId)">
          View
        </button>
      </template>

      </dd>
     
    </dl>

    <template v-if="localComment.parentId">

     <dl>
      <dt>Parent</dt>
      <dd>
         <button @click="modalStore.push('CommentDetail', 'Comment Details', localComment.parentId)">
          View
        </button>
      </dd>
     
    </dl>

    </template>

    <dl>
      <dt>Detail</dt>
      <dd v-html="sanitizeHtml(localComment.detail)"></dd>
    </dl>
   
      <template v-if="localComment.addendum">
      <dl>
         <dt>Addendum</dt>
        <dd>
         <ol>
          <li v-for="(addendum, index) in formatAddendum(localComment.addendum)" :key="index">
            {{ addendum }}
          </li>
        </ol>
      </dd>
      </dl>
      </template>

    <h3 class="modal-page-heading">
      Statistics
    </h3>

    <dl>
      <dt>Replies</dt>
      <dd>{{ formatCounts(localComment.repliesCount) }}</dd>
    </dl>
    <dl>
      <dt>Flags</dt>
      <dd>{{ formatCounts(localComment.flagsCount) }}</dd>
    </dl>
   
    <dl>
      <dt>Favorites</dt>
      <dd>{{ formatCounts(localComment.favoritesCount) }}</dd>
    </dl>
    <dl>
      <dt>Upvotes</dt>
      <dd>{{ formatCounts(localComment.upvotesCount) }}</dd>
    </dl>
    <dl>
      <dt>Downvotes</dt>
      <dd>{{ formatCounts(localComment.downvotesCount) }}</dd>
    </dl>
    <dl>
      <dt>Engagement Score</dt>
      <dd>{{ localComment.engagementScore }}</dd>
    </dl>

  </template>

  <template v-else>

    <PageStatusMessage 
    title="500: Unknown Error!"
    message="An unknown error occurred while retrieving the comment. Refresh page and try again.">
    </PageStatusMessage>

  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/description-list";
</style>