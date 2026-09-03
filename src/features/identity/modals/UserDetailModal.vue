<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PageMessageStatus from '@/components/PageMessageStatus.vue';
import { useUserStore } from '../stores/UserStore';
import { type UserDetailDto } from '../types/IdentityTypes';
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

const userId = computed(() => props.payload as string)

const userStore = useUserStore();
const modalStore = useModalStore();

// --- Component Reactive State ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  // 3. Fetch from store
  const { success, error } = await userStore.loadUser(userId.value)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving users. Refresh page and try again.'
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
    <h1>Loading Users... </h1>
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
  <template v-else-if="userStore.user">

    <div class="btn-group">

      <template v-if="userStore.user.status !== 'BannedByAdmin'">
        
      <template v-if="userStore.user.role === 'None'">

        <button 
          class="btn primary" 
          @click="modalStore.push('AssignRole', 'Assign Role', userStore.user.accountId)"
        >
          Assign
        </button>

      </template>

      <template v-if="userStore.user.status === 'SuspendedByAdmin' || userStore.user.status === 'HiddenByModeration'">

        <button 
          class="btn primary" 
          @click="modalStore.push('UserSuspensionDetail', 'Suspension Detail', userStore.user.accountId)"
        >
          Suspension
        </button>

      </template>

       <template v-else>
        <button 
          class="btn primary" 
          @click="modalStore.push('SuspendUser', 'Suspend User', userStore.user.accountId)"
        >
          Suspend
        </button>

      </template>

        <button 
          class="btn primary" 
          @click="modalStore.push('BanUser', 'Ban User', userStore.user.accountId)"
        >
          Ban
        </button>

      </template>

        <button 
            class="btn secondary" 
            @click="modalStore.push('SnapshotList', 'Tale Metrics', userStore.user.accountId)"
          >
            Metrics
          </button>
    </div>

    <dl>
      <dt>Date</dt>
      <dd>{{ toLongDate(userStore.user.registeredAt) }}</dd>
    </dl>

    <dl>
      <dt>Username</dt>
      <dd>
        {{ userStore.user.username }}
      </dd>
    </dl>
    
    <dl>
      <dt>Title</dt>
      <dd>{{ userStore.user.title }}</dd>
    </dl>

    <template v-if="userStore.user.country">

    <dl>
      <dt>Country</dt>
      <dd>
        {{ CountryDescriptions[userStore.user.country] }}
      </dd>
    </dl>

    </template>

     <template v-if="userStore.user.bio">

    <dl>
      <dt>Bio</dt>
      <dd>
        {{ userStore.user.bio }}
      </dd>
    </dl>

    </template>

      <template v-if="userStore.user.photo">

   <dl>
      <dt>Photo</dt>
      <dd  class="small-photo">
       <img  :src="mediaHelper.getUrl(userStore.user.photo, 'profiles')"/>
      </dd>
    </dl>

    </template>

     <template v-if="userStore.user.contacts !== null && userStore.user.contacts.length > 0">

   <dl>
      <dt>Tags</dt>
        <dd>
        <ul>
          <li v-for="(contact, index) in userStore.user.contacts" :key="index">
            {{ contact.type }} : {{ contact.title }}
          </li>
        </ul>
      </dd>
    </dl>

    </template>
   
    <dl>
      <dt>Moderation Score</dt>
      <dd>{{ userStore.user.moderationScore }}</dd>
    </dl>

    <dl>
      <dt>Status</dt>
      <dd>{{ userStore.user.status }}</dd>
    </dl>

     <dl>
      <dt>Role</dt>
      <dd>{{ userStore.user.role }}</dd>
    </dl>

    <h3 class="modal-page-heading">
      Statistics
    </h3>

    <dl>
      <dt>Profile Views</dt>
      <dd>{{ userStore.user.viewsCount }}</dd>
    </dl>
       <dl>
      <dt>Tales</dt>
      <dd>{{ formatCounts(userStore.user.talesCount) }}</dd>
    </dl>
       <dl>
      <dt>Insights</dt>
      <dd>{{ formatCounts(userStore.user.insightsCount) }}</dd>
    </dl>
    <dl>
      <dt>Comments</dt>
      <dd>{{ formatCounts(userStore.user.commentsCount) }}</dd>
    </dl>
    <dl>
      <dt>Replies</dt>
      <dd>{{ formatCounts(userStore.user.repliesCount) }}</dd>
    </dl>
    <dl>
      <dt>Tales' Upvotes</dt>
      <dd>{{ formatCounts(userStore.user.taleUpvotesCount) }}</dd>
    </dl>
       <dl>
      <dt>Insights' Upvotes</dt>
      <dd>{{ formatCounts(userStore.user.insightUpvotesCount) }}</dd>
    </dl>
    <dl>
      <dt>Comments' Upvotes</dt>
      <dd>{{ formatCounts(userStore.user.taleUpvotesCount) }}</dd>
    </dl>
 <dl>
      <dt>Tales' Downvotes</dt>
      <dd>{{ formatCounts(userStore.user.taleDownvotesCount) }}</dd>
    </dl>
       <dl>
      <dt>Insights' Downvotes</dt>
      <dd>{{ formatCounts(userStore.user.taleDownvotesCount) }}</dd>
    </dl>
    <dl>
      <dt>Comments' Downvotes</dt>
      <dd>{{ formatCounts(userStore.user.commentDownvotesCount) }}</dd>
    </dl>
 <dl>
      <dt>Tales' Favorites</dt>
      <dd>{{ formatCounts(userStore.user.taleFavoritesCount) }}</dd>
    </dl>
       <dl>
      <dt>Insights' Favorites</dt>
      <dd>{{ formatCounts(userStore.user.taleFavoritesCount) }}</dd>
    </dl>
    <dl>
      <dt>Comments' Favorites</dt>
      <dd>{{ formatCounts(userStore.user.taleFavoritesCount) }}</dd>
    </dl>
     <dl>
      <dt>Tales' Flags</dt>
      <dd>{{ formatCounts(userStore.user.taleFlagsCount) }}</dd>
    </dl>
       <dl>
      <dt>Insights' Flags</dt>
      <dd>{{ formatCounts(userStore.user.insightFlagsCount) }}</dd>
    </dl>
    <dl>
      <dt>Comments' Flags</dt>
      <dd>{{ formatCounts(userStore.user.commentFlagsCount) }}</dd>
    </dl>
     <dl>
      <dt>Tales' Shares</dt>
      <dd>{{ formatCounts(userStore.user.taleSharesCount) }}</dd>
    </dl>
       <dl>
      <dt>Insights' Shares</dt>
      <dd>{{ formatCounts(userStore.user.insightSharesCount) }}</dd>
    </dl>
     <dl>
      <dt>Followers</dt>
      <dd>{{ formatCounts(userStore.user.followersCount) }}</dd>
    </dl>
       <dl>
      <dt>Follows</dt>
      <dd>{{ formatCounts(userStore.user.followingsCount) }}</dd>
    </dl>

  </template>

 <template v-else>

    <PageStatusMessage 
    title="500: Unknown Error!"
    message="An unknown error occurred while retrieving the user. Refresh page and try again.">
    </PageStatusMessage>

  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/description-list";
</style>