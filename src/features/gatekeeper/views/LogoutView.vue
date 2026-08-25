<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGatekeeperStore } from '../stores/GatekeeperStore'
import { useModalStore } from '@/stores/modalStore'
import { useFormProgress } from '@/composables/useFormProgress'
import FormProgress from '@/components/FormProgress.vue'
import { useRouter } from 'vue-router'

const authStore = useGatekeeperStore()
const modalStore = useModalStore()
const router = useRouter()
const { progressState, startLoading, resetProgress } = useFormProgress()

// Local working state bound strictly to your official contract schema
// Initialized with a placeholder string value for form dropdown validation
const formData = ref<{ closeAll: boolean; }>({
  closeAll: false
})

function handleLogoutSubmission() {
  console.log('[LOGOUT-FORM] Fire-and-forget teardown initiated...');

  // 1. FIRE AND FORGET: Trigger the backend session drop in the background 
  // without using 'await'. The browser handles the request asynchronously.
  authStore.logout({
    closeAll: formData.value.closeAll,
    type: 1 // FrontendType.Admin
  })

  // 4. INSTANT UI RESET: Dismiss modal layout stack and go home
  //modalStore.closeAll()
  router.push('/')
}

onMounted(() => {
  resetProgress()
})
</script>

<template>
  <div class="form-container boxed">
    <h1>Logout</h1>
    <h2>Continue to close your active sessions</h2>

     <FormProgress :progress="progressState" :is-boxed="true" />

    <form @submit.prevent="handleLogoutSubmission" autocomplete="off">
     

      <fieldset class="expanded">
      <div class="ticks">
              <input 
                type="checkbox" 
                id="CloseAll" 
                v-model="formData.closeAll" 
              />
              
              <label for="CloseAll">
                {{ formData.closeAll 
                  ? 'Untick to log out of current device only' 
                  : 'Tick to log out of all devices' 
                }}
              </label>
        </div>
      </fieldset>
      

        <div class="button-holder">
          <button 
            type="submit" 
            class="btn contrast" 
            :disabled="progressState.type === 'Loading'"
            :class="{ active: progressState.type === 'Loading' }"
          >
            {{ progressState.type === 'Loading' ? 'Submitting...' : 'Logout' }}
          </button>
        </div>

    </form>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/css/form-input.less";

@import "@/assets/css/form-container.less";

</style>