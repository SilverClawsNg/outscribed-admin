<script setup lang="ts">
import { ref, onMounted, watch, computed, onBeforeMount } from 'vue'
import { useGatekeeperStore } from '../stores/GatekeeperStore'
import { useFormProgress } from '@/composables/useFormProgress'
import FormProgress from '@/components/FormProgress.vue'
import type { LoginRequest } from '../types/GatekeeperTypes'
import { APIError } from '@/api/apiTypes'
import TurnstileWidget from '@/components/TurnstileWidget.vue'

// 🎯 Context provided purely via Props from Parent Wrapper
const props = defineProps<{
  accountId: string
}>()

// 🎯 Clean situational events passed upwards
const emit = defineEmits<{
  (e: 'success'): void
  (e: 'fallback'): void
}>()

const authStore = useGatekeeperStore()
const { progressState, startLoading, setWarning, setError, resetProgress } = useFormProgress()

const siteKey = ref(import.meta.env.VITE_CLOUDFLARE_SITE_KEY)
const turnstileRef = ref<InstanceType<typeof TurnstileWidget> | null>(null)

const inputs = ref<HTMLInputElement[]>([])
const boxes = ref<string[]>(['', '', '', '', '', ''])

function handleCaptchaSuccess(token: string) {
  formData.value.captchaToken = token
}

function handleCaptchaError() {
  formData.value.captchaToken = null
  setWarning("Error occurred while verifying captcha. Refresh page and try again.")
}

function handleInput(e: Event, index: number) {
  const target = e.target as HTMLInputElement
  if (!target) return

  const val = target.value
  if (!val || !val[0]) return

  if (index >= 0 && index < boxes.value.length) {
    boxes.value[index] = val[0]
  }

  // Shift cursor focus to the next input field
  if (index < 5) {
    inputs.value[index + 1]?.focus()
  }

  // 🎯 FIX: Added () to execute handleSubmit on auto-fill/complete
  if (boxes.value.every(v => typeof v === 'string' && v !== '')) {
    handleSubmit()
  }
}

function handleKeyDown(e: KeyboardEvent, index: number) {
  if (e.key === 'Backspace' && index > 0) {
    const currentBoxValue = boxes.value[index]
    
    if (currentBoxValue === '') {
      boxes.value[index - 1] = ''
      inputs.value[index - 1]?.focus()
    }
  }
}

const formData = ref<LoginRequest>({
  accountId: props.accountId, // Hydrated directly from props
  token: '',
  captchaToken: ''
})

// --- RUN VALIDATION ---

// 1. Tracks whether the admin has at least attempted to submit the form once
const formSubmitted = ref(false)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

const tokenText = formData.value.token || '';

  return {
    token: formData.value.token.length < 6 
      ? 'Enter a valid token' 
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

  formData.value.token = boxes.value.join('');

  // 1. Tell the ecosystem the user has initiated an action
  formSubmitted.value = true

  // 2. Pure, clean execution guard. The watcher has already handled the UI text alerts!
  if (!isFormValid.value) return
  
  startLoading()

  const outcome = await authStore.login(formData.value)

  if (outcome.isFailure) {
    if (outcome.error) {
      setError(outcome.error)
    } else {
      setError(new APIError(0, 'Authentication Error', 'An unexpected connection failure occurred.'))
    }
    return
  }

  // 🎯 Let the caller handle post-authentication actions
  emit('success')
}

onBeforeMount(() => {
  resetProgress()
})

onMounted(() => {
  inputs.value[0]?.focus()
})

</script>

<template>
  <div class="form-container boxed">
    <h1>Login Verification</h1>
    <h2>Enter your 6-digit authenticator security token</h2>

    <FormProgress :progress="progressState" :is-boxed="true" />

    <form @submit.prevent="handleSubmit">

      <div class="otp-input-group">
        <input
          v-for="(_, index) in 6"
          :key="index"
          ref="inputs"
          v-model="boxes[index]"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="1"
          class="otp-box"
          @input="handleInput($event, index)"
          @keydown="handleKeyDown($event, index)"
        />
      </div>

       <span v-if="formSubmitted && validationErrors.token" class="validation-message">
        {{ validationErrors.token }}
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
        >
          {{ progressState.type === 'Loading' ? 'Verifying...' : 'Verify Token' }}
        </button>
      </div>

      <div class="form-options">
        Issue with authenticator?
        <button 
          type="button" 
          @click="emit('fallback')"
        >
          Use fallback login
        </button>
      </div>
    </form>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/css/form-container.less";
@import "@/assets/css/form-input.less";
</style>