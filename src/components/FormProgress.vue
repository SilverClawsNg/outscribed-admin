<script setup lang="ts">
import type { APIError } from '@/api/apiTypes'
import { useRoute, useRouter } from 'vue-router';
import { useModalStore } from '@/stores/modalStore'

export type LoadingProgress = 'Idle' | 'Loading' | 'Success' | 'Error' | 'Login' | 'Warning'

export interface ProgressState {
  type: LoadingProgress
  title: string | null
  message: string | null // 🎯 Fixed: String or null union matching the API
  error: APIError | null
}

defineProps<{
  progress: ProgressState
   isBoxed?: boolean
}>()

// 🎯 Define the exact functional actions your buttons emit
const emit = defineEmits<{
  (e: 'more-details', error: APIError): void
  (e: 'login'): void
}>()

const modalStore = useModalStore()

// --- DEFINE ROUTE FUNCTIONS ---
const route = useRoute();
const router = useRouter();
const currentPath = encodeURIComponent(route.fullPath)

function redirectToRegister() {
  router.push(`/register?returnUrl=${currentPath}`)
}

</script>

<template v-if="progress.type !== 'Idle'">
   
    <div v-if="progress.type === 'Loading'" class="form-loader">
      <p class="loader"></p>
    </div>

    <div v-else-if="progress.type === 'Success'" class="form-message-contents success" :class="{ boxed: isBoxed }">
      <p><span class="form-message-icon">✓</span> {{ progress.message }}</p>
    </div>

     <div v-else-if="progress.type === 'Warning'" class="form-message-contents warning" :class="{ boxed: isBoxed }">
      <p><span class="form-message-icon">⚠️</span> {{ progress.message }}</p>
    </div>

    <div v-else-if="progress.type === 'Error'" class="form-message-contents error-box" :class="{ boxed: isBoxed }">
      <h3 v-if="progress.title">
        <span class="form-message-icon">⛔</span> {{ progress.title }}
      </h3>
      <p class="error">{{ progress.message ?? 'An unexpected error occurred.' }}</p>
      
      <div class="error-actions"  v-if="progress.error">
        <button class="btn primary" @click="modalStore.push('ProblemDefinition', 'Problem Detail', progress.error)">
          More Details
        </button>
      </div>
    </div>

    <div v-else-if="progress.type === 'Login'" class="form-message-contents unauthorized" :class="{ boxed: isBoxed }">
      <h3><span class="form-message-icon">⛔</span> 401: Unauthorized!</h3>
      <p class="error">Login is required to continue.</p>
      <button class="btn primary" @click="modalStore.push('Register', 'Register')">Login</button>
    </div>

</template>

<style scoped>
@import "../assets/css/form-progress.less";

</style>