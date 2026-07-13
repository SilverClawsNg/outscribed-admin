<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PageMessageStatus from '@/components/PageMessageStatus.vue';
import { useAdminStore } from '../stores/AdminStore';
import { toLongDate } from '@/utils/dateExtensions'
import { APIError } from '@/api/apiTypes';
import { useRoute, useRouter } from 'vue-router';
import { useModalStore } from '@/stores/modalStore';
import { RoleTypeDescriptions, AdminTaskTypeDescriptions, AdminSecurityStatusDescriptions } from '@/utils/descriptors'


const props = defineProps<{
  payload: unknown // Arrives untouched as the raw string AccountId from your container
}>()

const authenticationId = computed(() => props.payload as string)

const adminStore = useAdminStore();
const modalStore = useModalStore();

// --- Component Reactive State ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)


// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  // 3. Fetch from store
  const { success, error } = await adminStore.loadAdmin(authenticationId.value)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving admins. Refresh page and try again.'
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
    <h1>Loading Admins... </h1>
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
  <template v-else-if="adminStore.admin">

    <div class="btn-group">

      <template v-if="adminStore.admin.isActive">

        <button 
          class="btn primary" 
          @click="modalStore.push('ReassignRole', 'Reassign Role', adminStore.admin.authenticationId)"
        >
          Reassign
        </button>

        <button 
          class="btn primary" 
          @click="modalStore.push('DeactivateRole', 'Deactivate Role', adminStore.admin.authenticationId)"
        >
          Deactivate
        </button>

      </template>

       <template v-else>
        
        <button 
          class="btn primary" 
          @click="modalStore.push('ActivateRole', 'Activate Role', adminStore.admin.authenticationId)"
        >
          Activate
        </button>

      </template>

      <button 
          class="btn primary" 
          @click="modalStore.push('ResetSecurityStatus', 'Reset Security', adminStore.admin.authenticationId)"
        >
          Reset
      </button>

    </div>

    <dl>
      <dt>Date</dt>
      <dd>{{ toLongDate(adminStore.admin.assignedAt) }}</dd>
    </dl>

    <dl>
      <dt>User</dt>
      <dd>
        {{ adminStore.admin.username }}
        <button @click="modalStore.push('UserDetail', 'User Details', adminStore.admin.accountId)">
          View
        </button>
      </dd>
    </dl>

    <dl>
      <dt>Role</dt>
      <dd>{{ RoleTypeDescriptions[adminStore.admin.role] }}</dd>
    </dl>

    <dl>
      <dt>Role Status</dt>
      <dd>{{ adminStore.admin.isActive }}</dd>
    </dl>

      <dl>
      <dt>Security Status</dt>
      <dd>{{ AdminSecurityStatusDescriptions[adminStore.admin.securityStatus] }}</dd>
    </dl>

     <template v-if="adminStore.admin.tasks !== null && adminStore.admin.tasks.length > 0">
      
    <h3 class="modal-page-heading">
      Tasks
    </h3>

         <template v-for="task in adminStore.admin.tasks">
           <dl>
            <dt>Date</dt>
            <dd>
              {{ toLongDate(task.completedAt) }}
            </dd>
           </dl>
            <dl>
            <dt>Task</dt>
            <dd>
             {{ AdminTaskTypeDescriptions[task.adminTaskType] }}
            </dd>
           </dl>
         </template>
    </template>

  </template>
</template>

<style lang="less" scoped>
@import "@/assets/css/description-list";
</style>