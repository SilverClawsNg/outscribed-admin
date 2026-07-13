<script setup lang="ts">
import FallbackComponent from '../components/FallbackComponent.vue'
import { ref, computed, onMounted } from 'vue';
import { useModalStore } from '@/stores/modalStore'

const modalStore = useModalStore()

onMounted(async () => {
  // 🧰 Clear the scan view, step down the stack, and load the OTP token box view
  modalStore.popPrevious()
})

function handleFallbackSuccess() {
  // Close the overlay stack completely to instantly unfreeze the dashboard page underneath
  modalStore.pop() 
}

</script>

<template>
      <FallbackComponent 
      :is-page="true" 
      @success="handleFallbackSuccess" 
      />
</template>