<script setup lang="ts">

// --- IMPORTS ---
import { ref, computed, watch, onBeforeMount } from 'vue'
import { useFaqStore } from '../stores/FaqStore'
import FormProgress from '@/components/FormProgress.vue'
import { useFormProgress } from '@/composables/useFormProgress'
import type { CreateFaqRequest } from '../types/SupportTypes'
import { useModalStore } from '@/stores/modalStore'
import { getValidFaqCategory } from '@/utils/validators'; 
import { FaqCategorySelectItems } from '@/utils/selectItemHelper'
import RichTextEditor from '@/components/RichTextEditor.vue'
import { useRoute, useRouter } from 'vue-router';

// --- INITIALIZE STORES ---
const faqStore = useFaqStore()
const modalStore = useModalStore()

// --- INITIALIZE FORM DATA FROM STORE ---
const formData = ref<CreateFaqRequest>({
   question: '',
  answer: '',
  category: '-1'
})

// --- UI TRANSACTION STATES ---
const { progressState, startLoading, setWarning, setError, resetProgress } = useFormProgress()

onBeforeMount(() => {

    resetProgress()

})

// --- RUN VALIDATION ---

// 1. Tracks whether the user has at least attempted to submit the form once
const formSubmitted = ref(false)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

const questionText = formData.value.question || '';
const answerText = formData.value.answer || '';
const parsedCategory = getValidFaqCategory(formData.value.category);

  return {
     question: questionText === '' || questionText.length < 10 || questionText.length > 128
      ? 'Question must be between 10 and 128 characters'
      : '',
      
    answer: answerText === '' || answerText.length < 10 || answerText.length > 2048 || answerText === '<p></p>'
      ? 'Answer must be between 10 and 2048 characters'
      : '',

    type: !parsedCategory
      ? 'You must select a category' 
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
      resetProgress()
    }
  }, 
  { immediate: true }
)

// --- HANDLE FORM SUBMISSION ---
async function handleFormSubmission() {

  // 1. Tell the ecosystem the user has initiated an action
  formSubmitted.value = true

  // 2. Pure, clean execution guard. The watcher has already handled the UI text alerts!
  if (!isFormValid.value) return

  startLoading()

 const { success, error } = await faqStore.createFaq(formData.value!)

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

    <h2>Create a new FAQ</h2>

   <FormProgress :progress="progressState" />


    <form @submit.prevent="handleFormSubmission" autocomplete="off">

    <fieldset :disabled="progressState.type === 'Loading'">
         <select v-model="formData.category" class="form-field">
            <option value="-1">-- select category --</option>
            <option v-for="item in FaqCategorySelectItems" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
      </fieldset>
        <!-- Only shows after submission attempt, disappears immediately when valid -->
      <span v-if="formSubmitted && validationErrors.type" class="validation-message">
        {{ validationErrors.type }}
      </span>

         <fieldset :disabled="progressState.type === 'Loading'">
          <textarea 
            v-model="formData.question" 
            id="Question" 
            class="form-field" 
            placeholder="Question" 
          ></textarea>
        </fieldset>

        <span v-if="formSubmitted && validationErrors.question" class="validation-message">
          {{ validationErrors.question }}
        </span>

     <RichTextEditor 
              id="editor"
              v-model="formData.answer" 
            />

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
            {{ progressState.type === 'Loading' ? 'Submitting...' : 'Create' }}
          </button>
        </div>
    </form>
  </div>

</template>

<style scoped>
@import "@/assets/css/form-input.less";
</style>