<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import LoginComponent from '../components/LoginComponent.vue'

const router = useRouter()
const route = useRoute()

const accountId = route.params.accountId as string
const returnUrl = (route.query.returnUrl as string) || '/'

function handleSuccess() {
  router.push(returnUrl)
}

function handleFallback() {
  router.push({ path: '/fallback', query: { returnUrl } })
}
</script>

<template>
  <main class="page-auth-layout">
    <LoginComponent 
      :account-id="accountId" 
      :is-boxed="true" 
      @success="handleSuccess"
      @fallback="handleFallback"
    />
  </main>
</template>