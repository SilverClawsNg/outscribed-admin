<script setup lang="ts">
import { useModalStore } from '@/stores/modalStore'
import RegisterComponent from '../components/RegisterComponent.vue'
import type { RegisterResponse } from '../types/GatekeeperTypes'

const modalStore = useModalStore()

function handleRegistrationSuccess(payload: RegisterResponse) {

  if (payload.status === 'NoTwoFactorEnabled') {

    modalStore.push('Challenge', 'Problem Detail', payload)
    
  } else if (payload.status === 'Active' || payload.status === 'TwoFactorWindowExpired') {
    
    modalStore.push('Login', 'Login', payload.accountId)

  }
}
</script>

<template>
  <RegisterComponent @success="handleRegistrationSuccess" />
</template>