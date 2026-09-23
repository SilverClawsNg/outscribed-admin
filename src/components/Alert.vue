<script setup lang="ts">
import { ref } from 'vue';
import { useAlert } from '@/composables/useAlert';

const alert = useAlert();
const isExecutingAction = ref(false);

async function handleActionClick() {
  if (!alert.onActionClick || isExecutingAction.value) return;

  try {
    isExecutingAction.value = true;
    // Fire the page-level method passed into the alert container parameters
    await alert.onActionClick();
  } catch (error) {
    console.error('Error executing alert action handler:', error);
  } finally {
    isExecutingAction.value = false;
  }
}
</script>
<template>
  <Transition name="slide">
    <div 
      v-if="alert.show" 
      class="alert" 
      :class="`alert--${alert.type.toLowerCase()}`"
      role="status" 
      aria-live="polite"
    >
      <div class="alert__wrapper">
        <div class="alert__icon-container">
          <span v-if="alert.type === 'Success'" class="alert__icon">✔️</span>
          <span v-else-if="alert.type === 'Warning'" class="alert__icon">⚠️</span>
          <span v-else-if="alert.type === 'Danger'" class="alert__icon">⛔</span>
          <span v-else-if="alert.type === 'Info'" class="alert__icon">ℹ️</span>
        </div>

        <div class="alert__body">
          <p class="alert__text">
            {{ alert.message }}
          </p>

          <div v-if="alert.type === 'Loading'" class="alert__loader"></div>

          <button 
            v-if="alert.onActionClick" 
            type="button"
            class="btn btn--primary alert__action-btn" 
            :disabled="isExecutingAction"
            @click="handleActionClick"
          >
            {{ alert.buttonText }}
          </button>
        </div>

        <div v-if="alert.type !== 'Loading'" class="alert__close-container">
          <button 
            type="button"
            class="alert__close-btn" 
            aria-label="Dismiss alert"
            @click="alert.close"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
