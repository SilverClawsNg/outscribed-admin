<script setup lang="ts">

// --- IMPORTS ---
import { ref, onBeforeMount, computed, watch } from 'vue'
import { useAdminStore } from '../stores/AdminStore'
import FormProgress from '@/components/FormProgress.vue'
import { useFormProgress } from '@/composables/useFormProgress'
import type { ConfirmRequest } from '../types/GatekeeperTypes'
import { useModalStore } from '@/stores/modalStore'
import { getValidRoleType } from '@/utils/validators'; 
import { RoleTypeSelectItems } from '@/utils/selectItemHelper'
import { useRoute, useRouter } from 'vue-router';

// --- INITIALIZE STORES ---
const adminStore = useAdminStore()
const modalStore = useModalStore()

// --- INITIALIZE FORM DATA FROM STORE ---
const formData = ref<ConfirmRequest>({
   authenticationId: '',
   type: '-1',
  confirm: false
})

// --- DEFINE ROUTE FUNCTIONS ---
const route = useRoute();
const router = useRouter();
const currentPath = encodeURIComponent(route.fullPath)

function redirectToRegister() {
  router.push(`/register?returnUrl=${currentPath}`)
}

// --- SET GUARD FOR NULL DETAILS/ INITIALIZE FORM DATA ---
const lockSubmission = ref(false)

onBeforeMount(() => {

   // --- ENSURE STORE HAS A CONTENT TO UPDATE ---
  if (!adminStore.admin) {

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
  formData.value.authenticationId = adminStore.admin.authenticationId
  resetProgress()

})

// --- UI TRANSACTION STATES ---
const { progressState, startLoading, setWarning, setError, resetProgress } = useFormProgress()

// --- RUN VALIDATION ---

// 1. Tracks whether the admin has at least attempted to submit the form once
const formSubmitted = ref(false)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

  const parsedType = getValidRoleType(formData.value.type);

  return {
    confirm: !formData.value.confirm 
      ? 'You must confirm action' 
      : '',
      
    type: !parsedType
      ? 'You must select a role' 
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

async function handleFormSubmission() {

// 1. Tell the ecosystem the admin has initiated an action
  formSubmitted.value = true

  // 2. Pure, clean execution guard. The watcher has already handled the UI text alerts!
  if (!isFormValid.value) return
 
  startLoading()

 const { success, error } = await adminStore.reassignRole(formData.value!)

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

    <h2>Confirm to re-assign role</h2>

  <FormProgress :progress="progressState" />


    <form @submit.prevent="handleFormSubmission" autocomplete="off">

        <fieldset :disabled="progressState.type === 'Loading'">
         <select v-model="formData.type" class="form-field">
            <option value="-1">-- select role --</option>
            <option v-for="item in RoleTypeSelectItems" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
      </fieldset>

      <span v-if="formSubmitted && validationErrors.type" class="validation-message">
        {{ validationErrors.type }}
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
            {{ progressState.type === 'Loading' ? 'Submitting...' : 'Reassign' }}
          </button>
        </div>
    </form>
  </div>

</template>

<style scoped>
@import "@/assets/css/form-input.less";
</style>