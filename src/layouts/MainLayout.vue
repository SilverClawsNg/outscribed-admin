<script setup lang="ts">
import { ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import MainHeader from '@/components/MainHeader.vue'
import ModalContainer from '@/components/ModalContainer.vue'
import Alert from '@/components/Alert.vue'; // 👈 Import alert store
import { watch } from 'vue'
import { useModalStore } from '@/stores/modalStore'

const route = useRoute()
const modalStore = useModalStore()

watch(() => route.path, () => modalStore.closeAll())
const currentHeaderClass = ref('state-neutral')

const handleHeaderClassChanged = (newClass: string) => {
  currentHeaderClass.value = newClass
}

</script>

<template>

  <div class="main-layout-wrapper">

    <Alert />

    <ModalContainer />
    
    <MainHeader @headerClassChanged="handleHeaderClassChanged" />

    <main class="main-layout">
      <RouterView />
    </main>

    <RouterLink to="/" title="Home" class="shared__site-icon">
      <img src="@/assets/images/icon.png" alt="OutScribed Icon" />
    </RouterLink>

  </div>

</template>