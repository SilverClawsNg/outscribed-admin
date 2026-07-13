<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  siteKey: string
}>()

const emit = defineEmits<{
  (e: 'success', token: string): void
  (e: 'error'): void
  (e: 'expired'): void
}>()

const container = ref<HTMLElement | null>(null)
let widgetId = ref<string | null>(null)

onMounted(() => {
  // Ensure Cloudflare script has loaded on the window object
  if (typeof (window as any).turnstile === 'undefined') {
    console.error("Turnstile script not detected. Ensure the Cloudflare script tag is present in index.html.")
    emit('error')
    return
  }

  // Native explicit rendering without needing a .NET Interop helper class wrapper
  widgetId.value = (window as any).turnstile.render(container.value, {
    sitekey: props.siteKey,
    size: 'flexible',
    callback: (token: string) => emit('success', token),
    'error-callback': () => emit('error'),
    'expired-callback': () => {
      reset()
      emit('expired')
    }
  })
})

// Clean up listeners on component teardown (Matches your DisposeAsync logic)
onBeforeUnmount(() => {
  remove()
})

// --- PUBLIC METHODS EXPOSED TO PARENT VIA REFS (BLAZOR PARITY) ---

function execute() {
  if (widgetId.value) (window as any).turnstile.execute(widgetId.value)
}

function reset() {
  if (widgetId.value) (window as any).turnstile.reset(widgetId.value)
}

function remove() {
  if (widgetId.value) {
    (window as any).turnstile.remove(widgetId.value)
    widgetId.value = null
  }
}

// Expose these methods to match your Blazor programmatic calls
defineExpose({
  execute,
  reset,
  remove
})
</script>

<template>
  <div ref="container" class="turnstile-widget-container"></div>
</template>