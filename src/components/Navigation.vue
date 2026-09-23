<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';


const emit = defineEmits<{
  (e: 'navigate'): void
}>()

const closeMenu = () => {
  emit('navigate')
}

</script>

<template>
    <!-- Block 1: Navigation -->
  <nav class="nav-sidebar">

    <ul class="nav-sidebar__menu">
      <li class="nav-sidebar__item">
         <RouterLink 
            to="/my/tasks" 
            class="nav-sidebar__link nav-sidebar__link--active"
            title="My Tasks Stats"
            @click="closeMenu"
          >
            <span class="nav-sidebar__label">My Tasks</span>
          </RouterLink>
      </li>
      <li class="nav-sidebar__item">
        <RouterLink 
          to="/" 
          class="nav-sidebar__link"
          exact-active-class="active" 
          title="Admin Tasks" 
          @click="closeMenu"
        >
          Metrics
        </RouterLink>
      </li>
      <li class="nav-sidebar__item">
         <RouterLink to="/tales" class="nav-sidebar__link" title="Tales Stats" @click="closeMenu">
          Tales
        </RouterLink>
      </li>
      <li class="nav-sidebar__item">
        <RouterLink to="/insights" class="nav-sidebar__link" title="Insights Stats" @click="closeMenu">
          Insights
        </RouterLink>
      </li>
       <li class="nav-sidebar__item">
        <RouterLink to="/comments" class="nav-sidebar__link" title="Comments Stats" @click="closeMenu">
          Comments
        </RouterLink>
      </li>
       <li class="nav-sidebar__item">
        <RouterLink to="/favorites" class="nav-sidebar__link" title="Favorites Stats" @click="closeMenu">
          Favorites
        </RouterLink>
      </li>
       <li class="nav-sidebar__item">
        <RouterLink to="/flags" class="nav-sidebar__link" title="Flags Stats" @click="closeMenu">
          Flags
        </RouterLink>
      </li>
       <li class="nav-sidebar__item">
        <RouterLink to="/shares" class="nav-sidebar__link" title="Shares Stats" @click="closeMenu">
          Shares
        </RouterLink>
      </li>
       <li class="nav-sidebar__item">
        <RouterLink to="/votes" class="nav-sidebar__link" title="Shares Stats" @click="closeMenu">
          Votes
        </RouterLink>
      </li>
       <li class="nav-sidebar__item">
        <RouterLink to="/admins" class="nav-sidebar__link" title="Admins Stats" @click="closeMenu">
          Admins
        </RouterLink>
      </li>
       <li class="nav-sidebar__item">
        <RouterLink to="/writers" class="nav-sidebar__link" title="Writers Stats" @click="closeMenu">
          Writers
        </RouterLink>
      </li>
        <li class="nav-sidebar__item">
        <RouterLink to="/users" class="nav-sidebar__link" title="Users Stats" @click="closeMenu">
          Users
        </RouterLink>
      </li>
        <li class="nav-sidebar__item">
        <RouterLink to="/stats" class="nav-sidebar__link" title="Stats" @click="closeMenu">
          Stats
        </RouterLink>
      </li>
        <li class="nav-sidebar__item">
        <RouterLink to="/inquiries" class="nav-sidebar__link" title="Inquiries Stats" @click="closeMenu">
          Inquiries
        </RouterLink>
      </li>
        <li class="nav-sidebar__item">
        <RouterLink to="/tags" class="nav-sidebar__link" title="Tags Stats" @click="closeMenu">
          Tags
        </RouterLink>
      </li>
        <li class="nav-sidebar__item">
        <RouterLink to="/verifications" class="nav-sidebar__link" title="Verifications Stats" @click="closeMenu">
          Verifications
        </RouterLink>
      </li>
        <li class="nav-sidebar__item">
        <RouterLink to="/suspensions" class="nav-sidebar__link" title="Suspensions Stats" @click="closeMenu">
          Suspensions
        </RouterLink>
      </li>
        <li class="nav-sidebar__item">
        <RouterLink to="/logs" class="nav-sidebar__link" title="Logs Stats" @click="closeMenu">
          Logs
        </RouterLink>
      </li>
        <li class="nav-sidebar__item">
        <RouterLink to="/analytics" class="nav-sidebar__link" title="Analytics Stats" @click="closeMenu">
          Analytics
        </RouterLink>
      </li>
    </ul>

  </nav>
</template>

<style lang="less" scoped>
   @import "../assets/css/navigation.less";
</style>