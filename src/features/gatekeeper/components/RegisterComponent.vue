<script setup lang="ts">
import { ref, onMounted, reactive, watch, computed } from 'vue'
import { useFormProgress } from '@/composables/useFormProgress'
import FormProgress from '@/components/FormProgress.vue'
import type { RegisterRequest, RegisterResponse } from '../types/GatekeeperTypes'
import { postAsync } from '@/api/apiPostServices'
import { APIError } from '@/api/apiTypes'
import TurnstileWidget from '@/components/TurnstileWidget.vue'

const emit = defineEmits<{
  (e: 'success', payload: RegisterResponse): void
}>()

const { progressState, startLoading, setWarning, setError, resetProgress } = useFormProgress()

const siteKey = ref(import.meta.env.VITE_CLOUDFLARE_SITE_KEY)
const turnstileRef = ref<InstanceType<typeof TurnstileWidget> | null>(null)

function handleCaptchaSuccess(token: string) {
  formData.value.captchaToken = token
}

function handleCaptchaError() {
  formData.value.captchaToken = null
  setWarning("Error occurred while verifying captcha. Refresh page and try again.")
}

const formData = ref<RegisterRequest>({
  username: '',
  password: '',
  captchaToken: ''
})

const passwordVisible = ref(false)

// --- RUN VALIDATION ---

// 1. Tracks whether the admin has at least attempted to submit the form once
const formSubmitted = ref(false)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

const usernameText = formData.value.username || '';
const passwordText = formData.value.password || '';

  return {
  
    username: usernameText === '' || usernameText.length < 2 || usernameText.length > 20
      ? 'Enter a valid username'
      : '',

    password: passwordText === '' || passwordText.length < 8
      ? 'Enter a valid password'
      : ''
  }
})


// 3. Form is valid if all computed error fields are empty strings
const isFormValid = computed(() => {
  return Object.values(validationErrors.value).every(error => error === '')
})

// --- 4. The centralized warning to ensures the to warning is in sync with the form field warnings ---
// It monitors form health and automatically dictates top-level notification state
watch(
  [isFormValid, formSubmitted], 
  ([isValid, submitted]) => {
    // Don't disturb the admin if they haven't tried to submit yet
    if (!submitted) return

    if (!isValid) {
      setWarning('Ensure all fields are filled out correctly before submission.')
    } else {
      // Clear warning and clean up state immediately when compliance is met
      resetProgress()
    }
  }, 
  { immediate: true }
)


async function handleSubmit() {

  // 1. Tell the ecosystem the admin has initiated an action
  formSubmitted.value = true

  // 2. Pure, clean execution guard. The watcher has already handled the UI text alerts!
  if (!isFormValid.value) return

  startLoading()

  try {
    const outcome = await postAsync<RegisterResponse, any>('/api/twofactor/register', formData.value, false)

    turnstileRef.value?.remove()

    if (outcome.isFailure || !outcome.value) {
      setError(outcome.error || new APIError(500, 'Registration Failed', 'Unknown server error occured. Refresh page and try again.'));
    } else {
      // 🎯 BUBBLE UP: Hand the response payload directly to the parent handler
      emit('success', outcome.value)
    }
  } catch (err: any) {
    setError(err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.', 'Client.Exception'));
  }
}

onMounted(() => {
  resetProgress()
})

</script>

<template>

  <div class="form-container boxed">

    <h1>Register</h1>
    <h2>Enter your credentials to register for two factor authentication</h2>

    <FormProgress :progress="progressState" :is-boxed="true" />

    <form @submit.prevent="handleSubmit">
      <fieldset>
        <input 
          v-model="formData.username" 
          type="text" 
          class="form-field" 
          placeholder="Username" 
        />
      </fieldset>

        <span v-if="formSubmitted  && validationErrors.username" class="validation-message">
    {{ validationErrors.username }}
  </span>

      <fieldset class="password-box">
        <button 
          type="button" 
          class="show-password" 
          @click="passwordVisible = !passwordVisible"
        >
          👁️
        </button>
        <input 
          v-model="formData.password" 
          :type="passwordVisible ? 'text' : 'password'" 
          class="form-field" 
          placeholder="Password" 
        />
      </fieldset>

        <span v-if="formSubmitted  && validationErrors.password" class="validation-message">
    {{ validationErrors.password }}
  </span>

      <TurnstileWidget 
        ref="turnstileRef"
        :site-key="siteKey" 
        @success="handleCaptchaSuccess"
        @error="handleCaptchaError"
        @expired="formData.captchaToken = null"
      />

      <div class="button-holder">
        <button 
          type="submit" 
          class="btn contrast" 
          :disabled="progressState.type === 'Loading'"
          :class="{ active: progressState.type === 'Loading' }"
        >
          {{ progressState.type === 'Loading' ? 'Submitting...' : 'Register' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/css/form-container.less";
@import "@/assets/css/form-input.less";
</style>