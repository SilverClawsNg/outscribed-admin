<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import SvgIcons from '@/components/SvgIcons.vue'

// Menu responsive state flag toggler
const showMenuClass = ref<string | null>(null);

const toggleMenu = () => {
  showMenuClass.value = showMenuClass.value === null ? 'show' : null;
};

const closeMenu = () => {
  showMenuClass.value = null;
};
</script>

<template>

  <header class="main-header" id="main-header">

    <section class="main-header__top-navigation-container">
        
      <section class="main-header__top-navigation">
        
        <div class="main-header__top-navigation-left">
          <button class="hamburger" @click="toggleMenu">
            <div></div><div></div><div></div>
          </button>
            <RouterLink to="/" title="Home">
           <SvgIcons name="home" /> 
          </RouterLink>
        </div>

        <div class="main-header__top-navigation-center">

          <h1 class="logo">
           <SvgIcons name="logo" />
          </h1>
        </div>

        <div class="main-header__top-navigation-right">
          <RouterLink 
            to="/my/tasks" 
            class="btn primary" 
            title="My Tasks Stats"
            @click="closeMenu"
          >
           <SvgIcons name="user" /> <span>Tasks</span>
          </RouterLink>
          
          <RouterLink 
            to="/logout" 
            class="btn secondary" 
            title="Logout"
            @click="closeMenu"
          >
             <SvgIcons name="padlock" /> <span>Logout</span>
          </RouterLink>
        </div>

      </section>
    </section>

    <section class="main-header__menu-container" :class="showMenuClass">

      <nav class="main-header__menu">
        
        <RouterLink 
          to="/" 
          class="btn primary" 
          exact-active-class="active" 
          title="Admin Tasks" 
          @click="closeMenu"
        >
          Tasks
        </RouterLink>
        
        <RouterLink to="/tales" class="btn primary" title="Tales Stats" @click="closeMenu">
          Tales
        </RouterLink>
        
        <RouterLink to="/insights" class="btn primary" title="Insights Stats" @click="closeMenu">
          Insights
        </RouterLink>
        
        <RouterLink to="/comments" class="btn primary" title="Comments Stats" @click="closeMenu">
          Comments
        </RouterLink>
        
        <RouterLink to="/favorites" class="btn primary" title="Favorites Stats" @click="closeMenu">
          Favorites
        </RouterLink>
        
        <RouterLink to="/flags" class="btn primary" title="Flags Stats" @click="closeMenu">
          Flags
        </RouterLink>
        
        <RouterLink to="/shares" class="btn primary" title="Shares Stats" @click="closeMenu">
          Shares
        </RouterLink>
        
        <RouterLink to="/votes" class="btn primary" title="Votes Stats" @click="closeMenu">
          Votes
        </RouterLink>
        
        <RouterLink to="/admins" class="btn primary" title="Admins Stats" @click="closeMenu">
          Admins
        </RouterLink>
        
        <RouterLink to="/writers" class="btn primary" title="Writers Stats" @click="closeMenu">
          Writers
        </RouterLink>
        
        <RouterLink to="/users" class="btn primary" title="Users Stats" @click="closeMenu">
          Users
        </RouterLink>
        
        <RouterLink to="/engagements" class="btn primary" title="Engagements Stats" @click="closeMenu">
          Stats
        </RouterLink>
        
        <RouterLink to="/faqs" class="btn primary" title="Faqs Stats" @click="closeMenu">
          FAQs
        </RouterLink>
        
        <RouterLink to="/inquiries" class="btn primary" title="Inquiries Stats" @click="closeMenu">
          Inquiries
        </RouterLink>
        
        <RouterLink to="/tags" class="btn primary" title="Tags Stats" @click="closeMenu">
          Tags
        </RouterLink>
        
        <RouterLink to="/verifications" class="btn primary" title="Verifications Stats" @click="closeMenu">
          Verifications
        </RouterLink>
        
        <RouterLink to="/logs" class="btn primary" title="Logs Stats" @click="closeMenu">
          Logs
        </RouterLink>
        
        <RouterLink to="/analytics" class="btn primary" title="Analytics Stats" @click="closeMenu">
          Analytics
        </RouterLink>
      </nav>
    </section>
    
  </header>
</template>

<style lang="less" scoped>
   @import "../assets/css/header.less";
</style>