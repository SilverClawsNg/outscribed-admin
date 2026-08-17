<script setup lang="ts">

// --- IMPORTS ---
import { ref, onBeforeMount, computed, watch, onMounted } from 'vue'
import { useUserStore } from '../stores/UserStore'
import FormProgress from '@/components/FormProgress.vue'
import { useFormProgress } from '@/composables/useFormProgress'
import type { ConfirmRequest } from '../types/IdentityTypes'
import { useModalStore } from '@/stores/modalStore'
import { useRoute, useRouter } from 'vue-router';

// --- INITIALIZE STORES ---
const userStore = useUserStore()
const modalStore = useModalStore()

// --- INITIALIZE FORM DATA FROM STORE ---
const formData = ref<ConfirmRequest>({
   accountId: '',
   notes: '',
  confirm: false
})

// --- SET GUARD FOR NULL DETAILS/ INITIALIZE FORM DATA ---
const lockSubmission = ref(false)

onBeforeMount(() => {

   // --- ENSURE STORE HAS A CONTENT TO UPDATE ---
  if (!userStore.user) {

    // 1. Lock down the form immediately to block accidental click updates
    lockSubmission.value = true
    
    // 2. Pass a friendly, descriptive error straight down to your message layout
    setError({
      title: "Content Unavailable",
      detail: "Unable to load current user details. Refresh page and try again",
      status: 204 // Standard missing resource code
    })
    
    return // 🛑 Stop initialization; do not attempt to read properties of null
  }

 // --- INITIALIZE FORM DATA FROM STORE ---
  formData.value.accountId = userStore.user.accountId
  resetProgress()

})

// --- UI TRANSACTION STATES ---
const { progressState, startLoading, setWarning, setError, resetProgress } = useFormProgress()

// --- RUN VALIDATION ---

// 1. Tracks whether the user has at least attempted to submit the form once
const formSubmitted = ref(false)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

  const notesText = formData.value.notes || '';

  return {
    confirm: !formData.value.confirm 
      ? 'You must confirm action' 
      : '',
      
    notes: notesText === '' || notesText.length < 10 || notesText.length > 2096
      ? 'Notes must be between 10 and 2096 characters'
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
    // Don't disturb the user if they haven't tried to submit yet
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

async function handleFormSubmission() {

// 1. Tell the ecosystem the user has initiated an action
  formSubmitted.value = true

  // 2. Pure, clean execution guard. The watcher has already handled the UI text alerts!
  if (!isFormValid.value) return
 
  startLoading()

 const { success, error } = await userStore.suspendUser(formData.value!)

  if(!success){

        formSubmitted.value = false

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

    <h2>Confirm to suspend user</h2>

   <FormProgress :progress="progressState" />


    <form @submit.prevent="handleFormSubmission" autocomplete="off">

       <fieldset :disabled="progressState.type === 'Loading' || lockSubmission">
          <textarea 
            v-model="formData.notes" 
            id="Notes" 
            class="form-field" 
            placeholder="Notes" 
          ></textarea>
        </fieldset>

        <span v-if="formSubmitted && validationErrors.notes" class="validation-message">
        {{ validationErrors.notes }}
      </span>

      <fieldset :disabled="progressState.type === 'Loading' || lockSubmission">
         <div class="ticks">
            <input 
                  v-model="formData.confirm" 
                  type="checkbox" 
                  id="Confirm"
                />
              <label For="Confirm">Tick to confirm action </label>
          </div>
        </fieldset>
     
   <span v-if="formSubmitted  && validationErrors.confirm" class="validation-message">
    {{ validationErrors.confirm }}
  </span>

   <div class="button-holder">
          <button 
            type="submit" 
            class="btn primary" 
              :disabled="progressState.type === 'Loading' || lockSubmission"
          >
            {{ progressState.type === 'Loading' ? 'Submitting...' : 'Suspend' }}
          </button>
        </div>
    </form>
  </div>

</template>

<style scoped>
@import "@/assets/css/form-input.less";
</style>