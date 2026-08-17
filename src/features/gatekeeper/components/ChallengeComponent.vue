<script setup lang="ts">
import { ref, onMounted } from 'vue';
import QRCode from 'qrcode';
import FormProgress from '@/components/FormProgress.vue'
import { useFormProgress } from '@/composables/useFormProgress'

// 🎯 Context completely supplied via Props from Parent
const props = defineProps<{
  accountId: string
  qrCodeUri: string
}>()


// 🎯 Emitted when the user finishes scanning and is ready to enter a token
const emit = defineEmits<{
  (e: 'success'): void
}>()

const svgImageMarkup = ref<string>('');
const { progressState, startLoading, setWarning, resetProgress } = useFormProgress()

onMounted(async () => {
  resetProgress()
  
  if (!props.qrCodeUri) {
    setWarning('No valid registration parameters were supplied to initialize registration.');
    return;
  }

  try {
    const svgString = await QRCode.toString(props.qrCodeUri, {
      type: 'svg',
      margin: 4,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    
    svgImageMarkup.value = svgString;
  } catch (err) {
    setWarning('Failed to compile visual 2FA cryptographic parameters.');
  }
});

const handleSubmit = () => {
  startLoading()
  // 🎯 BUBBLE UP: Let the parent swap screens or execute routing transitions
  emit('success')
};
</script>

<template>
  <div class="form-container boxed">
    <h1>Scan Code</h1>
    <h2>Open Google Authenticator app and scan the QR code below</h2>

    <FormProgress :progress="progressState" :is-boxed="true" />

    <form @submit.prevent="handleSubmit">
      <div class="qr-container">
        <div class="svg-container">
          <div v-if="svgImageMarkup" v-html="svgImageMarkup"></div>
          <p v-else>Generating QR Code...</p>
        </div>
      </div>

      <div class="button-holder">
        <button 
          type="submit" 
          class="btn contrast" 
          :disabled="progressState.type === 'Loading'"
          :class="{ active: progressState.type === 'Loading' }"
        >
          {{ progressState.type === 'Loading' ? 'Processing...' : 'Continue to Verification' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/css/form-input.less";
@import "@/assets/css/form-container.less";
</style>