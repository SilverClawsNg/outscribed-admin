<script setup lang="ts">
import { ref, onMounted } from 'vue'

defineProps<{ isLoading: boolean; timer: number; canResend: boolean }>()
const emit = defineEmits<{ (e: 'verify', token: string): void; (e: 'resend'): void }>()

const inputs = ref<HTMLInputElement[]>([])
const boxes = ref<string[]>(['', '', '', '', '', ''])

onMounted(() => {
  inputs.value[0]?.focus()
})

function handleInput(e: Event, index: number) {
  const target = e.target as HTMLInputElement
  if (!target) return

  const val = target.value
  if (!val || !val[0]) return

  // 🎯 FIX: Force TypeScript to acknowledge that the index write operation is valid
  if (index >= 0 && index < boxes.value.length) {
    boxes.value[index] = val[0]
  }

  // Shift cursor focus to the next input field
  if (index < 5) {
    inputs.value[index + 1]?.focus()
  }

  // Auto-submit when all fields contain a valid, non-empty character string value
  if (boxes.value.every(v => typeof v === 'string' && v !== '')) {
    emit('verify', boxes.value.join(''))
  }
}

function handleKeyDown(e: KeyboardEvent, index: number) {
  if (e.key === 'Backspace' && index > 0) {
    // 🎯 FIX: Safe array extraction guard for strict indexed checking rules
    const currentBoxValue = boxes.value[index]
    
    if (currentBoxValue === '') {
      boxes.value[index - 1] = ''
      inputs.value[index - 1]?.focus()
    }
  }
}
</script>

<template>
  
  <form @submit.prevent="emit('verify', boxes.join(''))">
    <div class="otp-input-group">
      <input
        v-for="(_, index) in 6"
        :key="index"
        ref="inputs"
        v-model="boxes[index]"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        maxlength="1"
        class="otp-box"
        @input="handleInput($event, index)"
        @keydown="handleKeyDown($event, index)"
      />
    </div>

    <div class="button-holder">
      <button type="submit" class="btn contrast" :disabled="isLoading">
        {{ isLoading ? 'Submitting...' : 'Continue' }}
      </button>

      <div class="form-options">
        Didn't receive the token?
        <button 
          type="button" 
          :disabled="!canResend"
          :class="{ disabled: !canResend }"
          @click="emit('resend')"
        >
          Resend <span v-if="timer > 0">in {{ timer }} seconds</span>
        </button>
      </div>
    </div>
  </form>
</template>

<style lang="less" scoped>
@import "@/assets/css/form-input.less";
</style>