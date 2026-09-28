<script setup>
const props = defineProps({
  payload: {
    type: String,
    required: true
  }
});
</script>

<template>

  <div class="help-topics-container">
    
     <template v-if="payload === 'AdminAuthentication'">

        <div class="topic-content rich-text">
            <h4>Two-factor Registration</h4>
            <p></p>
          </div>
     </template>
     
    <!-- Fallback / Default -->
       <template v-else>
        <div class="topic-content">
          <h4>Help & Support</h4>
          <p>No specific details are available for this section yet.</p>
      </div>
     </template>
 

  </div>
</template>

<style lang="less" scoped>
@import "@/assets/css/rich-text.less";
</style>