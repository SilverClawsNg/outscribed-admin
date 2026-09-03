<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';

import { APIError } from '@/api/apiTypes';
import PageStatusMessage from '@/components/PageMessageStatus.vue';
import { toLongDate } from '@/utils/dateExtensions';
import { formatFullCounts } from '@/utils/stringHelpers';
import { useStatsStore } from '../stores/StatsStore';

const statsStore = useStatsStore();

// --- DEFINE & INITIALIZE LOCAL VARIABLES ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)
    
// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

    console.log('🚀 [Home Stats View]: Initi page...')

  // 3. Fetch from store
  const { success, error } = await statsStore.loadStats()

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving stats. Refresh page and try again.'
      );
  }
  }

  // No matter the result, stop loading
  isLoading.value = false

}

const route = useRoute();
const router = useRouter();
const currentPath = encodeURIComponent(route.fullPath)


// --- DEFINE PAGE FUNCTIONS ---
function redirectToRegister() {
  router.push(`/register?returnUrl=${currentPath}`)
}

// --- MOUNT PAGE ---
onMounted(async () => {
  await initPage();
})

</script>

<template>

   <template v-if="isLoading">

   <div class="shared__page-title">
    <h1>Loading Metrics... </h1>
      <p class="shared__loader"></p>
    </div>

  </template>

 <template v-else-if="loadingError">

    <PageStatusMessage 
      :title="loadingError.title || 'Error Loading Lists'" 
      :message="loadingError.detail || 'An unexpected error occurred.'">
        <template v-if="loadingError.status == 401" #actions>
        <button class="btn primary" @click="redirectToRegister">Login</button>
      </template>
    </PageStatusMessage>

  </template>

 <template v-else-if="statsStore.stats">

<div class="admin-welcome-page">
   <div class="admin-welcome-container">
     <h1> Welcome Admin</h1>

 <h2>Select a menu item to get started</h2>
 <h3>Stats last updated: {{ toLongDate(statsStore.stats.lastUpdatedAt) }}</h3>

  <div class="admin-menu-containers">

     <RouterLink 
          to="/tasks" 
          class="btn primary index-link" 
          exact-active-class="active" 
          title="Admin Tasks" 
          
        >
        <span class="value">{{ formatFullCounts(statsStore.stats.readStats.adminTasksCount) }}</span>
         <span class="field">Tasks</span>
          
        </RouterLink>
        
        <RouterLink to="/tales" class="btn primary index-link" title="Tales Stats">
             <span class="value">{{ formatFullCounts(statsStore.stats.readStats.talesCount) }}</span>
         <span class="field">Tales</span>
          
        </RouterLink>
        
        <RouterLink to="/insights" class="btn primary index-link" title="Insights Stats">
             <span class="value">{{ formatFullCounts(statsStore.stats.readStats.insightsCount) }}</span>
         <span class="field">Insights</span>
          
        </RouterLink>
        
        <RouterLink to="/comments" class="btn primary index-link" title="Comments Stats">
             <span class="value">{{ formatFullCounts(statsStore.stats.readStats.commentsCount) }}</span>
         <span class="field">Comments</span>
          
        </RouterLink>
        
        <RouterLink to="/favorites" class="btn primary index-link" title="Favorites Stats">
             <span class="value">{{ formatFullCounts(statsStore.stats.readStats.favoritesCount) }}</span>
         <span class="field">Favorites</span>
          
        </RouterLink>
        
        <RouterLink to="/flags" class="btn primary index-link" title="Flags Stats">
             <span class="value">{{ formatFullCounts(statsStore.stats.readStats.flagsCount) }}</span>
         <span class="field">Flags</span>
          
        </RouterLink>
        
        <RouterLink to="/shares" class="btn primary index-link" title="Shares Stats">
             <span class="value">{{ formatFullCounts(statsStore.stats.readStats.sharesCount) }}</span>
         <span class="field">Shares</span>
          
        </RouterLink>
        
        <RouterLink to="/votes" class="btn primary index-link" title="Votes Stats">
             <span class="value">{{ formatFullCounts(statsStore.stats.readStats.votesCount) }}</span>
         <span class="field">Votes</span>
          
        </RouterLink>
        
        <RouterLink to="/admins" class="btn primary index-link" title="Admins Stats">
             <span class="value">{{ formatFullCounts(statsStore.stats.readStats.adminsCount) }}</span>
         <span class="field">Admins</span>
          
        </RouterLink>
        
        <RouterLink to="/writers" class="btn primary index-link" title="Writers Stats">
             <span class="value">{{ formatFullCounts(statsStore.stats.readStats.writersCount) }}</span>
         <span class="field">Writers</span>
          
        </RouterLink>
        
        <RouterLink to="/users" class="btn primary index-link" title="Users Stats">
             <span class="value">{{ formatFullCounts(statsStore.stats.readStats.usersCount) }}</span>
         <span class="field">Users</span>
          
        </RouterLink>
        
        <RouterLink to="/snapshots" class="btn primary index-link" title="Engagements Stats">
             <span class="value">{{ formatFullCounts(statsStore.stats.readStats.snapshotsCount) }}</span>
         <span class="field">SnapShots</span>
          
        </RouterLink>
        
        <RouterLink to="/inquiries" class="btn primary index-link" title="Inquiries Stats">
             <span class="value">{{ formatFullCounts(statsStore.stats.readStats.inquiriesCount) }}</span>
         <span class="field">Inquiries</span>
          
        </RouterLink>
        
        <RouterLink to="/tags" class="btn primary index-link" title="Tags Stats">
             <span class="value">{{ formatFullCounts(statsStore.stats.readStats.tagsCount) }}</span>
         <span class="field">Tags</span>
          
        </RouterLink>
        
        <RouterLink to="/verifications" class="btn primary index-link" title="Verifications Stats">
             <span class="value">{{ formatFullCounts(statsStore.stats.readStats.verificationsCount) }}</span>
         <span class="field">Verifications</span>
          
        </RouterLink>

          <RouterLink to="/suspensions" class="btn primary index-link" title="Verifications Stats">
             <span class="value">{{ formatFullCounts(statsStore.stats.readStats.suspensionsCount) }}</span>
         <span class="field">Suspensions</span>
          
        </RouterLink>
        
        <RouterLink to="/logs" class="btn primary index-link" title="Logs Stats">
             <span class="value">{{ formatFullCounts(statsStore.stats.logsCount) }}</span>
         <span class="field">Logs</span>
          
        </RouterLink>
        
        <RouterLink to="/analytics" class="btn primary index-link" title="Analytics Stats">
             <span class="value">{{ formatFullCounts(statsStore.stats.analyticsCount) }}</span>
         <span class="field">Analytics</span>
          
        </RouterLink>
 </div>

    </div>
    </div>
  </template>

    <template v-else>
    <PageStatusMessage
      title="No Content!"
      message="Stats could not be retrieved. Use the menu for navigation.">
    </PageStatusMessage>
  </template>

</template>

<style lang="less" scoped>
   @import "@/assets/css/welcome-page.less";
</style>