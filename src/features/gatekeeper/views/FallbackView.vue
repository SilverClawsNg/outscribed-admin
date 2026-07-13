<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import Fallback from '../components/FallbackComponent.vue'

const router = useRouter()
const route = useRoute()

function handleFallbackSuccess() {
  // Grab the returnUrl query token if it exists (e.g., /login?returnUrl=/profile)
  const destination = (route.query.returnUrl as string) || '/'
  router.push(destination)
}
</script>

<template>
      <Fallback 
      :is-page="true" 
      @success="handleFallbackSuccess" 
      />
</template>