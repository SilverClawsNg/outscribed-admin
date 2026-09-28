<script setup lang="ts">
import ModalContainer from '@/components/ModalContainer.vue'
import { watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useModalStore } from '@/stores/modalStore'

const route = useRoute()
const modalStore = useModalStore()

watch(() => route.path, () => modalStore.closeAll())

</script>

<template>
  
  <ModalContainer />
    
  <div class="form-page">

     <main class="form-layout">
      
      <RouterLink to="/" title="Home" class="icon">
        <img src="@/assets/images/icon.png" alt="OutScribed Icon" />
      </RouterLink>

         <RouterView />
    </main>
 
  </div>

</template>

<style lang="less" scoped>
@import "@/assets/css/form-page.less";
</style>