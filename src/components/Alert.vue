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
      class="alert-container" 
      :class="`alert-type-${alert.type.toLowerCase()}`"
      role="status" 
      aria-live="polite"
    >
      <div class="alert-wrapper">
        <p class="alert-icon">
          <span v-if="alert.type === 'Success'">✔️</span>
          <span v-else-if="alert.type === 'Warning'">⚠️</span>
          <span v-else-if="alert.type === 'Danger'">⛔</span>
          <span v-else-if="alert.type === 'Info'">ℹ️</span>
        </p>

        <div class="alert-content">
          <p class="alert-text">
            {{ alert.message }}
          </p>

          <div v-if="alert.type === 'Loading'" class="loader"></div>

          <button 
            v-if="alert.onActionClick" 
            class="btn primary" 
            :disabled="isExecutingAction"
            @click="handleActionClick"
          >
            {{ alert.buttonText }}
          </button>
        </div>

        <button 
          v-if="alert.type !== 'Loading'" 
          class="alert-close" 
          aria-label="Dismiss alert"
          @click="alert.close"
        >×</button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Scoped layout animations mimicking your Blazor classes */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease;
}

.slide-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>