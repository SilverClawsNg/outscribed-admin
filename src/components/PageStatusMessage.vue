<script setup lang="ts">
// 1. Import your custom SVG icon registry we built earlier
import SvgIcons from '@/components/SvgIcons.vue'

// 2. Define your component parameters (Props)
defineProps<{
  title?: string
  message?: string
  icon?: IconName // Allows passing a custom icon string, falling back to defaults
  isBordered?: boolean
  isStandalone?: boolean
}>()

export type IconName = 'check' | 'broken-chain' | 'inbox' |'warning' | 'archive' | 'fail' | 'shield';

</script>

<template>
 <div 
  class="page-status-message-container" 
  :class="{ 'page-status-message-container--standalone': isStandalone }"
>
  <div 
    class="page-status-message"
    :class="[
      isBordered ? 'page-status-message--bordered' : null,
      isStandalone ? 'page-status-message--standalone' : null
    ]"
  >
    <!-- Icon Holder -->
    <div class="page-status-message__icon-wrapper">
      <SvgIcons 
        :name="icon || 'broken-chain'" 
        class="page-status-message__icon" 
      />
    </div>

    <!-- Text Content Stack -->
    <div class="page-status-message__body">
      <h1 v-if="title" class="page-status-message__title">{{ title }}</h1>
      <p v-if="message" class="page-status-message__text">{{ message }}</p>

      <div v-if="$slots.actions" class="page-status-message__actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
</div>
</template>

<style lang="less" scoped>
   @import "../assets/css/page-status-message.less";
</style>