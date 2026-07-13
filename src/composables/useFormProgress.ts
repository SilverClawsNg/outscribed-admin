import { ref } from 'vue'
import { APIError } from '@/api/apiTypes'
import type { LoadingProgress } from '@/components/FormProgress.vue'

// 🎯 Ensure 'export' is here
export interface ProgressState {
  type: LoadingProgress
  title: string | null
  message: string | null
  error: APIError | null
}

export function useFormProgress() {
  const progressState = ref<ProgressState>({
    type: 'Idle',
    title: null,
    message: null,
    error: null
  })

  // 🎯 FIX: No parameter string required anymore!
  const startLoading = () => {
    progressState.value = { type: 'Loading', title: null, message: null, error: null }
  }

  const setSuccess = (message: string) => {
    progressState.value = { type: 'Success', title: null, message, error: null }
  }

 const setWarning = (message: string) => {
    progressState.value = { type: 'Warning', title: null, message, error: null }
  }

  const setError = (error: APIError) => {
    if (error.status === 401) {
      progressState.value = {
        type: 'Login',
        title: '401: Login Required',
        message: 'You must be signed in to perform this action.',
        error
      }
    } else {
      progressState.value = {
        type: 'Error',
        title: error.title || 'Action Failed',
        message: error.detail ?? 'An unexpected network error occurred.', 
        error
      }
    }
  }

  const resetProgress = () => {
    progressState.value = { type: 'Idle', title: null, message: null, error: null }
  }

  return {
    progressState,
    startLoading,
    setSuccess,
    setWarning,
    setError,
    resetProgress
  }
}