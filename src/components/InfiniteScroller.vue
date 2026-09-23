<script setup lang="ts">
import type { APIError } from '@/api/apiTypes';
import { ref, onMounted, onUnmounted } from 'vue'
import PageStatusMessage from '@/components/PageStatusMessage.vue'

const props = defineProps<{
  hasNext: boolean // Determines if there are more pages to load
  isFetching: boolean            // Blocks multiple concurrent requests
  error: APIError | null  // Displays error UI if present
}>()

const emit = defineEmits(['loadMore', 'retry'])

const sentinelRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

// Pure utility debounce to restrict rapid intersection evaluations
const debounce = (func: Function, wait: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: any[]) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

const debouncedLoadMore = debounce(() => {
  // Guard clause: Don't fetch if already downloading, errored out, or out of pages
  if (props.isFetching || props.error || !props.hasNext) return
  emit('loadMore')
}, 250)

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    // If the sentinel crosses the threshold, and no errors block the stack, trigger next page

    if (!entries || entries.length === 0 || !entries[0]) return
    
    if (entries[0].isIntersecting) {
      debouncedLoadMore()
    }
  }, {
    rootMargin: '0px 0px 400px 0px', // Fetch 400px before reaching the exact bottom
    threshold: 0.01
  })

  if (sentinelRef.value) {
    observer.observe(sentinelRef.value)
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<template>

    <slot />

    <div ref="sentinelRef" id="scroll-sentinel" style="height: 1px;"></div>

    <section class="container">

    <PageStatusMessage v-if="error"
        :title="error.title || 'Loading Error!'" 
        :message="error.detail || 'An unexpected error occured while loading contents'"
        icon="warning"
        :is-bordered="true">
        <template #actions>
          <button type="button" class="btn btn--primary"  @click="emit('retry')">
            Retry
          </button>
        </template>
      </PageStatusMessage>

      <p v-else-if="hasNext" class="loader__dot"></p>

      <p v-else class="loaded"></p>

    </section>

</template>

