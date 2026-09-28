<script setup>
import { useModalStore } from '@/stores/modalStore'; // Adjust to your actual store import

const props = defineProps({
  topic: {
    type: String,
    required: true // e.g., "CreateAccount"
  },
  title: {
    type: String,
    default: 'Help Topics'
  }
});

const modalStore = useModalStore();

function openHelp() {
  modalStore.push('HelpTopics', props.title, props.topic);
}
</script>

<template>
  <button type="button" class="help-icon-btn" @click="openHelp" title="Click for help">
    [See Help Topic]
  </button>
</template>
