<script setup lang="ts">
// This lets you use one file to hold all your bespoke icons cleanly
defineProps<{
  name: 'logo' | 'user' | 'padlock' | 'broken-chain' | 'minimize' | 'maximize' | 'back-arrow' | 'home'
  size?: number
}>()
</script>

<template>
  <svg 
    v-if="name === 'logo'" 
    viewBox="0 0 789 172" 
    fill="currentColor" 
    v-bind="$attrs"
  >
    <path d="M374 7c-3 15-25 18-41 6l-4-3-23 14-23 15v33l11 7 11 8-9 11a65 65 0 0 0-20 28c-8 32 30 54 65 37q14-8 21-20 5-14-5-3-6 9-19 13c-7 3-28 4-36 2q-20-4-22-17-1-14 22-13 14 1 24 9l5 4 23-14 22-14V68l-4-3-19-10q-2 0 8-10 18-19 18-37 1-5-2-4-3 0-3 3m-60 42v17l-4-3-5-3V46c0-12 0-14 2-16q1-1 4 1l3 1zm13-11c8 3 24 3 30 0l5-2-3 4-5 6-17 14c-12 12-13 12-15 11l-3-1V53l1-17zm10 34 3 1v18l-1 19-8-2c-6-2-8-2-18-2-10-1-12 0-16 2l-6 2 27-26 16-14zm17 27c0 17-1 19-2 20l-5-2-3-2V75l5 3 5 2zM43 11c-9 4-21 15-26 23Q4 55 5 81c1 14 3 21 8 32q13 24 37 29c24 5 56-21 67-53 3-10 4-25 2-35q-5-15-15-28c-6-6-16-14-21-15L59 21l-24 9c0-1 6-10 12-15q5-5 4-6c0-3 0-3-8 2m27 65v48h-6q-11-1-20-10c-6-5-13-15-12-17l16-8 15-6V24l4 2 3 1zm13-39c5 4 13 15 14 19q2 1-11 7l-11 6V50c0-22-1-21 8-13M41 61v26l-5 2-6 2-3-7c-2-7-2-24 0-33q2-14 8-15c6-3 6-4 6 25m60 6 1 5-26 14-1-6 1-5 11-6 12-6zm0 32q-6 17-21 23l-5 2V92l14-7 13-7 1 7zm476-80-14 11 2 2 4 4c2 2 2 4 2 42v40l-5 4q-6 3-5 5 0 2 5-1l3-1 12 7 13 8 18-11 19-10V68l-8-7-9-8-10 7-10 6-1-28-1-28-15 10m29 53 5 6v47l-2-1-9-6-7-3V73l3-3 5-2zm-75-54-8 7-4 4 5 6 7 8 2 2 8-7 8-7-7-7-7-8zm189 12c0 14 0 15 2 14l9 7 8 7-10 6-10 6v52l10 7 13 8c1 1 5-1 20-10l18-10V70l4-2q4-3 1-5 0-3-4 1-3 3-5 1l-55-48q-1-3-1 14m38 70v25l-8-6-9-5V61l9 8 8 7zM230 53l-13 15 2 1 4 3c2 2 2 3 2 23v21l-5 4-5 3v2q1 3 4 0l3-2 9 8 9 7 11-6q14-6 11-7 0-3-4 0-3 2-7-3l-4-4V68l7-1c6 0 6 0 9-4l4-5h-20v-9q1-12-2-10zm175 9-16 9-1 25v25l13 9c12 8 13 8 15 7 4-2 24-20 24-21q0-3-7 1-4 3-7 3-8-1-14-7l-2-3V67l8 6q7 6 8 4l14-11-18-14zm77-3-6 7-6-7-6-6-21 14v2q1 3 4 0l4-2 2 3 3 4v44l-5 3-5 5q0 3 5 0l3-1 9 7 9 7 12-9c12-9 13-9 11-11q0-3-7 2l-3 2-4-2-3-3V70l5 3q21 9 26-16l-1-5-5 2q-6 5-12 0l-3-2zm-347 1q-12 8-10 8h3q4-3 9 1l2 24v22l-3 2-2 3 2 2 12 10 8 7 10-8q13-11 12-5c0 5 7 12 11 12l11-7q12-6 9-8-1-3-5 0-6 5-7-4V67l3-2q4-3 2-5l-1-2-3 2c-4 3-3 3-11-4l-3-3-8 7-8 7 5 4 4 4v43l-4 2-4 3-5-4-5-5V90c-1-23-1-23-3-28l-7-7-4-2zm387 0c-13 8-13 8-11 9q0 3 4 0l4-2 2 3 3 4v44l-5 4-5 4q0 3 5 0l3-1 7 7 9 6 22-18q-2-2-6 1l-4 2-2-2-3-2V68l-6-7-7-8zm145 3-19 10v23l-1 22-4 3q-4 3-2 5t5-1l4-3 13 9 12 8 34-27-1-3q0-2-9 5l-9 7q0 2-11-6c-10-6-10-7-10-10v-4l18-11 18-11-2-3-8-13-7-10zm10 10 6 9 2 3-8 5-8 5V67q3-4 8 6" />
  </svg>

  <svg 
    v-else-if="name === 'user'" 
    :width="size || 20" 
    :height="size || 20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="1" 
    v-bind="$attrs"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
  
   <svg 
    v-else-if="name === 'padlock'" 
    :width="size || 20" 
    :height="size || 20" 
    viewBox="0 0 48 48" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="1" 
    v-bind="$attrs"
  >
    
        <defs></defs>
        <path class="a" d="M24,25.28a3.26,3.26,0,0,0-1.64,6.07V36h3.32V31.35a3.28,3.28,0,0,0,1.61-2.8v0A3.27,3.27,0,0,0,24,25.28Z" />
        <rect class="a" x="7.38" y="17.77" width="33.23" height="25.73" rx="4.32" />
        <path class="a" d="M13.35,17.77V15.16a10.66,10.66,0,0,1,21.32,0v2.61" />
    </svg>


  <svg 
    v-else-if="name === 'broken-chain'" 
    :width="size || 20" 
    :height="size || 20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="1" 
    v-bind="$attrs"
  >
    
    <path d="M10 9H8C6.34315 9 5 10.3431 5 12C5 13.6569 6.34315 15 8 15H9M9 15L12 12M9 15L5 19M14 9H15M15 9L19 5M15 9L12 12M14 15H16C17.6569 15 19 13.6569 19 12C19 11.1716 18.6642 10.4216 18.1213 9.87868M8 12H12M15 12H16"  />
  </svg>

  
  <svg 
    v-else-if="name === 'maximize'" 
    :width="size || 20" 
    :height="size || 20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="1" 
    v-bind="$attrs"
  >
    <path d = "M8 8h8v8H8z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d = "M16 8h6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d = "M16 16h6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d = "M8 8V2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d = "M8 16v6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>

   <svg 
    v-else-if="name === 'minimize'" 
    :width="size || 20" 
    :height="size || 20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="1" 
    v-bind="$attrs"
  >
   <path d = "M4 4h16v16H4z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
 <path d = "M2 4h2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
 <path d = "M2 20h2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
 <path d = "M20 4h2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
 <path d = "M20 20h2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>

  <svg 
    v-else-if="name === 'back-arrow'" 
    :width="size || 20" 
    :height="size || 20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="1" 
    v-bind="$attrs">
        <path d="M15 18L9 12L15 6"  />
    </svg>

   <svg 
    v-else-if="name === 'home'" 
    :width="size || 20" 
    :height="size || 20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="1" 
    v-bind="$attrs">
        <path d="M12 2L2 9V22H10V15H14V22H22V9L12 2Z" />
    </svg>

</template>