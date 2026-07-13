<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import RegisterComponent from '../components/RegisterComponent.vue'
import type { RegisterResponse } from '../types/GatekeeperTypes'

const router = useRouter()
const route = useRoute()

const returnUrl = (route.query.returnUrl as string) || ''

function handleRegistrationSuccess(payload: RegisterResponse) {
  if (payload.status === 'NoTwoFactorEnabled') {
    router.push({
      path: `/challenge/${payload.accountId}`,
      query: { qrCodeUri: payload.qrCodeUri, returnUrl }
    })
  } else if (payload.status === 'Active' || payload.status === 'TwoFactorWindowExpired') {
    router.push({
      path: `/login/${payload.accountId}`,
      query: { returnUrl }
    })
  }
}

</script>

<template>
 <RegisterComponent @success="handleRegistrationSuccess" />
</template>