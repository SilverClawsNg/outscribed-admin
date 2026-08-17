<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import TurnstileWidget from '@/components/TurnstileWidget.vue'
import { useFormProgress } from '@/composables/useFormProgress'
import { isValidEmail } from '@/utils/validators'

const props = defineProps<{ isLoading: boolean; siteKey: string }>()
const emit = defineEmits<{ (e: 'submit', email: string, captchaToken: string): void }>()
const { progressState, startLoading, setWarning, setError, resetProgress } = useFormProgress()

const emailAddress = ref('')
const captchaToken = ref<string | null>(null)

// Template Ref mapping to bind to the custom widget component instance
const turnstileRef = ref<InstanceType<typeof TurnstileWidget> | null>(null)

function handleCaptchaSuccess(token: string) {
  captchaToken.value = token
}

function handleCaptchaError() {
  captchaToken.value = null
  setWarning("Error occurred while verifying captcha. Refresh page and try again.")
}


// --- RUN VALIDATION ---

// 1. Tracks whether the admin has at least attempted to submit the form once
const formSubmitted = ref(false)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

const emailText = emailAddress.value || '';

  return {
  
    email: emailText === '' || !isValidEmail(emailText)
      ? 'Enter a valid email address'
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
      // 🎯 Only reset if we are clearing a warning!
      if (progressState.value.type === 'Warning') {
        resetProgress()
      }
    }
  }, 
  { immediate: true }
)


function handleSubmit() {
   // 1. Tell the ecosystem the admin has initiated an action
  formSubmitted.value = true

  // 2. Pure, clean execution guard. The watcher has already handled the UI text alerts!
  if (!isFormValid.value || !captchaToken.value) return

  emit('submit', emailAddress.value, captchaToken.value)
  
  // Clean up widget security listeners cleanly on submission (Matches your _turnstileRef.RemoveAsync())
  turnstileRef.value?.remove()
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <fieldset class="boxed">
      <input 
        v-model="emailAddress" 
        type="email" 
        placeholder="Email Address" 
        class="form-field" 
        required 
      />
    </fieldset>

        <span v-if="formSubmitted  && validationErrors.email" class="validation-message">
    {{ validationErrors.email }}
  </span>

    <TurnstileWidget 
      ref="turnstileRef"
      :site-key="siteKey" 
      @success="handleCaptchaSuccess"
      @error="handleCaptchaError"
      @expired="captchaToken = null"
    />

    <div class="button-holder">
      <button 
        type="submit" 
        class="btn contrast" 
        :disabled="isLoading || !captchaToken"
      >
        {{ isLoading ? 'Submitting...' : 'Continue' }}
      </button>
    </div>
  </form>
</template>

<style lang="less" scoped>
/* You can safely drop your layout timeline.less or unique home rules down here */
@import "@/assets/css/form-input.less";

</style>