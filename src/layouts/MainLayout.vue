<script setup lang="ts">
import { ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import MainHeader from '@/components/MainHeader.vue'
import ModalContainer from '@/components/ModalContainer.vue'
import Alert from '@/components/Alert.vue'; // 👈 Import alert store
import { watch } from 'vue'
import { useModalStore } from '@/stores/modalStore'
import Navigation from '@/components/Navigation.vue';
import SvgIcons from '@/components/SvgIcons.vue'

const route = useRoute()
const modalStore = useModalStore()

watch(() => route.path, () => modalStore.closeAll())

const isOpen = ref(false)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
}

</script>

<template>

  <div class="main-layout-wrapper">

    <Alert />

    <ModalContainer />
    
    <Navigation @navigate="closeMenu" />

    <!-- Block 2: Main Contents Wrapper -->
  <div class="main-content" :class="{ 'main-content--open': isOpen }">

    <header class="main-content__header">
      <!-- Vertical Hamburger Controller -->
     <button 
          class="hamburger-btn" 
          title="Toggle Sidebar" 
          type="button"
          @click="toggleMenu"
        >
          <span class="hamburger-btn__bar"></span>
          <span class="hamburger-btn__bar"></span>
          <span class="hamburger-btn__bar"></span>
        </button>
      <h1 class="main-content__page-title"><SvgIcons name="logo" /></h1>
    </header>

    <main class="main-content__body">
      <RouterView />
    </main>
  </div>
   
  </div>

</template>


<style lang="less" scoped>
   @import "../assets/css/main-layout.less";
</style>