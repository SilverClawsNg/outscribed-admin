<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import ChallengeComponent from '../components/ChallengeComponent.vue'

const router = useRouter()
const route = useRoute()

const accountId = route.params.accountId as string
const qrCodeUri = (route.query.qrCodeUri as string) || ''
const returnUrl = (route.query.returnUrl as string) || ''

function handleSuccess() {
  router.push({
    path: `/login/${accountId}`,
    query: { returnUrl }
  })
}
</script>

<template>
  <ChallengeComponent 
      :account-id="accountId" 
      :qr-code-uri="qrCodeUri"
      @success="handleSuccess"
    />
</template>