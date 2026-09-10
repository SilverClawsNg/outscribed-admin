<script setup lang="ts">
import { ref } from 'vue'
import { APIError } from '@/api/apiTypes.ts'
import { useGatekeeperStore } from '../stores/GatekeeperStore.ts'
import type { FallbackRequest, SendTokenResponse} from '../types/GatekeeperTypes.ts'
import { postAsync } from '@/api/apiPostServices'

// Composables & Shared UI
import { useFormProgress } from '@/composables/useFormProgress.ts'
import FormProgress from '@/components/FormProgress.vue'

// Step Subcomponents
import SendTokenStep from './SendTokenComponent.vue'
import VerifyTokenStep from './VerifyTokenComponent.vue'

import { useModalStore } from '@/stores/modalStore'

const modalStore = useModalStore()

const authStore = useGatekeeperStore()

const activeStep = ref(1)

//const router = useRouter()
//const route = useRoute()


// 🎯 Conditional layout environment prop flags
interface Props {
  isPage?: boolean
}
withDefaults(defineProps<Props>(), {
  isPage: true
})

// 🎯 Add specialized modal action emits alongside your success emit
const emit = defineEmits<{
  success: []
}>()

// Initialize state container with default state
const { progressState, startLoading, setSuccess, setWarning, setError, resetProgress } = useFormProgress()

// State Persistence across Step Transitions
const verificationId = ref<string | null>(null)
const savedEmailAddress = ref('')
const countdownTimer = ref(0)
const canResendToken = ref(false)

let timerInterval: number | null = null

// Derived from environment configs (swaps automatically between dev/prod)
const siteKey = ref(import.meta.env.VITE_CLOUDFLARE_SITE_KEY)

/**
 * --- STEP 1: Submit Email & Captcha Verification ---
 */
async function onEmailSubmitted(email: string, captchaToken: string) {
  savedEmailAddress.value = email
  startLoading()

  const sendTokenData = {
    emailAddress: email,
    captchaToken: captchaToken,
    type: 3 // TwoFactorFallback Enum Value
  }

  const outcome = await postAsync<SendTokenResponse>('/api/token', sendTokenData, false)

   if (outcome.isFailure) {
    
    // 🛡️ THE FIX: Ensure outcome.error is not null before feeding it to setError
    if (outcome.error) {
      setError(outcome.error)
    } else {
      // Fallback in case a failure happens without an explicit server payload
      setError(new APIError(0, 'Server Error', 'An unknown server failure occurred.  Refresh page and try again'))
    }
    return
  } else {

    // 🎯 CASE 2: The endpoint hit HTTP 200, but identity domain rules failed (e.g., wrong password)
  if (!outcome.value || !outcome.value?.verificationId) {

      setError(new APIError(0, 'Server Error', 'An unknown server failure occurred. Refresh page and try again'))
      return
  }

  // Happy Path: Save verification token context and advance
  setSuccess('Verification token sent successfully.')

    verificationId.value = outcome.value.verificationId
    activeStep.value = 2
    startResendTimer()
  }
}

/**
 * --- STEP 2: Verify 6-Digit OTP Token ---
 */
async function onTokenVerified(otpToken: string) {


  startLoading()

  const formData = ref<FallbackRequest>({
    verificationId: verificationId.value,
    token: otpToken
 })
 
  // 🎯 Store does all token mutations under the hood, returning Result<boolean>
  const outcome = await authStore.fallbackLogin(formData.value)


 // 🎯 2. Guard with an explicit check on outcome.isFailure
  if (outcome.isFailure) {
    
    // 🛡️ THE FIX: Ensure outcome.error is not null before feeding it to setError
    if (outcome.error) {
      setError(outcome.error)
    } else {
      // Fallback in case a failure happens without an explicit server payload
      setError(new APIError(0, 'Authentication Error', 'An unexpected connection failure occurred.'))
    }
    return
  }

  //const returnUrl = (route.query.returnUrl as string) || '/timelines'
  //router.push(returnUrl)
    emit('success')

}

/**
 * --- Countdown Timer Utilities ---
 */
function startResendTimer() {
  if (timerInterval) clearInterval(timerInterval)
  
  canResendToken.value = false
  countdownTimer.value = 90
  
  // 🎯 Explicitly use window.setInterval to guarantee a numeric return type
  timerInterval = window.setInterval(() => {
    countdownTimer.value--
    if (countdownTimer.value <= 0) {
      if (timerInterval) clearInterval(timerInterval)
      canResendToken.value = true
    }
  }, 1000)
}

function handleResendRequest() {
  if (timerInterval) clearInterval(timerInterval)
  activeStep.value = 1 // Kick back to Step 1 to re-trigger Captcha challenges
}

</script>

<template>

  <div class="form-container boxed">

     <template v-if="isPage">
    <h1>Login</h1>
    </template>

    <h2>Use Fallback login</h2>

  <FormProgress :progress="progressState" :is-boxed="true"/>

    <article class="multi-form">
      
      <section>
        <div class="multi-form__header">
          <span :class="{ active: activeStep === 1 }"></span>
          <h3>Enter Email Address</h3>
        </div>
        <div class="multi-form__step" :class="{ expanded: activeStep === 1 }">
          <SendTokenStep 
            v-if="activeStep === 1"
            :is-loading="progressState.type === 'Loading'" 
            :site-key="siteKey" 
            @submit="onEmailSubmitted"
          />
        </div>
      </section>

      <section>
        <div class="multi-form__header">
          <span :class="{ active: activeStep === 2 }"></span>
          <h3>Verify Email Address</h3>
        </div>
        <div class="multi-form__step" :class="{ expanded: activeStep === 2 }">
          <VerifyTokenStep 
            v-if="activeStep === 2"
            :is-loading="progressState.type === 'Loading'"
            :timer="countdownTimer"
            :can-resend="canResendToken"
            @verify="onTokenVerified"
            @resend="handleResendRequest"
          />
        </div>
      </section>

    </article>
  </div>
</template>
<style lang="less" scoped>
/* You can safely drop your layout timeline.less or unique home rules down here */
@import "@/assets/css/form-container.less";

</style>