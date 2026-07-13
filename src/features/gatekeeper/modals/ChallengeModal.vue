<script setup lang="ts">
import { useModalStore } from '@/stores/modalStore'
import ChallengeComponent from '../components/ChallengeComponent.vue'
import { ref, computed, onMounted } from 'vue';
import type { RegisterResponse } from '../types/GatekeeperTypes'

const modalStore = useModalStore()

// Receives context layout from the previous modal instantiation event payload
const props = defineProps<{
  payload: unknown 
}>()

const registerResponse = computed(() => props.payload as RegisterResponse)

onMounted(async () => {
  // 🧰 Clear the scan view, step down the stack, and load the OTP token box view
  modalStore.popPrevious()
})

function handleSuccess() {
  modalStore.push('Login', 'Login', registerResponse.value.accountId)
}

</script>

<template>
  <div class="admin-modal-reauth">
    <ChallengeComponent 
      :account-id="registerResponse.accountId" 
      :qr-code-uri="registerResponse.qrCodeUri"
      @success="handleSuccess"
    />
  </div>
</template>