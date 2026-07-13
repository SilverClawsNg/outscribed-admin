<script setup lang="ts">
import { useModalStore } from '@/stores/modalStore'
import LoginComponent from '../components/LoginComponent.vue'
import { ref, computed, onMounted } from 'vue';

const modalStore = useModalStore()

// Read arbitrary state data passed down into the modal layout manager on instantiation
const props = defineProps<{
  modalContext: { accountId: string }
}>()

onMounted(async () => {
  // 🧰 Clear the scan view, step down the stack, and load the OTP token box view
  modalStore.popPrevious()
})

function handleSuccess() {
  // Close the overlay stack completely to instantly unfreeze the dashboard page underneath
  modalStore.pop() 
}

function handleFallback() {
  modalStore.push('Fallback', 'Fallback Login')
}
</script>

<template>
  <div class="admin-modal-reauth">
    <LoginComponent 
      :account-id="modalContext.accountId" 
      :is-boxed="false"
      @success="handleSuccess"
      @fallback="handleFallback"
    />
  </div>
</template>