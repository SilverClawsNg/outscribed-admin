<script setup lang="ts">
import { computed } from 'vue';
import { APIError } from '@/api/apiTypes';
import { sanitizeHtml } from '@/utils/markupHelper';

const props = defineProps<{
  payload: unknown // Arrives untouched as the raw string AccountId from your container
}>()

const error = computed(() => props.payload as APIError)

</script>

<template>

  
    <dl>
      <dt>Status Code</dt>
      <dd>{{ error.status }}</dd>
    </dl>
    
    <dl>
      <dt>Title</dt>
      <dd>{{error.title }}</dd>
    </dl>

    <dl>
      <dt>Message</dt>
      <dd>{{ error.detail }}</dd>
    </dl>
 
 <template v-if="error.definition">

    <dl>
      <dt>Definition</dt>
      <dd  v-html="sanitizeHtml(error.definition)"></dd>
    </dl>

  </template>


</template>

<style lang="less" scoped>
@import "@/assets/css/description-list";
</style>