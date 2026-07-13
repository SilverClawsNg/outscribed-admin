<script setup lang="ts">

// --- IMPORTS ---
import { ref, computed, watch, onBeforeMount } from 'vue'
import { useInquiryStore } from '../stores/InquiryStore'
import FormProgress from '@/components/FormProgress.vue'
import { useFormProgress } from '@/composables/useFormProgress'
import type { AnswerInquiryRequest } from '../types/SupportTypes'
import { useModalStore } from '@/stores/modalStore'
import { useRoute, useRouter } from 'vue-router';

// --- INITIALIZE STORES ---
const inquiryStore = useInquiryStore()
const modalStore = useModalStore()

// --- INITIALIZE FORM DATA FROM STORE ---
const formData = ref<AnswerInquiryRequest>({
   inquiryId: '',
  answer: ''
})

// --- UI TRANSACTION STATES ---
const { progressState, startLoading, setWarning, setError, resetProgress } = useFormProgress()


// --- SET GUARD FOR NULL DETAILS/ INITIALIZE FORM DATA ---
const lockSubmission = ref(false)

onBeforeMount(() => {

   // --- ENSURE STORE HAS A CONTENT TO UPDATE ---
  if (!inquiryStore.inquiry) {

    // 1. Lock down the form immediately to block accidental click updates
    lockSubmission.value = true
    
    // 2. Pass a friendly, descriptive error straight down to your message layout
    setError({
      title: "Content Unavailable",
      detail: "Unable to load current admin details. Refresh page and try again",
      status: 204 // Standard missing resource code
    })
    
    return // 🛑 Stop initialization; do not attempt to read properties of null
  }

 // --- INITIALIZE FORM DATA FROM STORE ---
  formData.value.inquiryId = inquiryStore.inquiry.inquiryId
  resetProgress()

})

// --- RUN VALIDATION ---

// 1. Tracks whether the user has at least attempted to submit the form once
const formSubmitted = ref(false)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

 const answerText = formData.value.answer || '';

  return {
      
    answer: answerText === '' || answerText.length < 10 || answerText.length > 2048
      ? 'Answer must be between 10 and 2048 characters'
      : '',

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
    // Don't disturb the user if they haven't tried to submit yet
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

async function handleFormSubmission() {

  // 1. Tell the ecosystem the user has initiated an action
  formSubmitted.value = true

  // 2. Pure, clean execution guard. The watcher has already handled the UI text alerts!
  if (!isFormValid.value) return

  startLoading()

 const { success, error } = await inquiryStore.answerInquiry(formData.value!)

  if(!success){

    if(error){
      setError(error)
    } else{
          setWarning('An unknown error occured. Refresh page and try again')
    }
  } else{
 
    // Close down the active overlay panel instance securely
    modalStore.pop()
  
  }
  
}

</script>

<template>

     <div class="form-container">

    <h2>Respond to inquiry</h2>

   <FormProgress :progress="progressState" />


    <form @submit.prevent="handleFormSubmission" autocomplete="off">
   
         <fieldset :disabled="progressState.type === 'Loading' || lockSubmission">
          <textarea 
            v-model="formData.answer" 
            id="Answer" 
            class="form-field" 
            placeholder="Answer" 
          ></textarea>
        </fieldset>

        <span v-if="formSubmitted && validationErrors.answer" class="validation-message">
          {{ validationErrors.answer }}
        </span>

   <div class="button-holder">
          <button 
            type="submit" 
            class="btn primary" 
              :disabled="progressState.type === 'Loading'"
            :class="{ active: progressState.type === 'Loading' }"
          >
            {{ progressState.type === 'Loading' ? 'Submitting...' : 'Answer' }}
          </button>
        </div>
    </form>
  </div>

</template>

<style scoped>
@import "@/assets/css/form-input.less";
</style>