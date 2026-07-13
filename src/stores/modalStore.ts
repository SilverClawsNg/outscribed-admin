import { defineStore } from 'pinia'
import { ref, computed, nextTick } from 'vue'

export interface ModalInstance {
  id: string
  type: string
  title: string
  payload?: any
  isEntering: boolean
  isLeaving: boolean
  // Resolvers function handles (Replacing TaskCompletionSource<bool>)
  resolve?: (value: boolean) => void
  onSuccessCallback?: () => Promise<void> | void
}

export const useModalStore = defineStore('modal', () => {
  // Underlying reactive state array representing your Stack<Modal>
  // Top of the stack is always at index 0 for easy UI styling
  const modalStack = ref<ModalInstance[]>([])
  const isContainerOpen = computed(() => modalStack.value.some(m => !m.isLeaving))
  const isOpen = computed(() => modalStack.value.length > 0)
  const stackDepth = computed(() => modalStack.value.length)

const activeModal = computed(() => modalStack.value.length > 0 ? modalStack.value[0] : null)

  /**
   * Pushes a new modal onto the stack and returns a Promise if waitForResult is true
   */
 function push(
  type: string, 
  title: string, 
  payload: any = null, 
  waitForResult = false, // 🎯 Default inverted to match Vue's state model
  onSuccessCallback?: () => Promise<void> | void
): Promise<boolean> {
  
  if (stackDepth.value === 0) {
    lockBodyScroll()
  }

  let resolver: (value: boolean) => void = () => {}
  
  const completionPromise = new Promise<boolean>((resolve) => {
    resolver = resolve
  })

  const newModal: ModalInstance = {
    id: crypto.randomUUID(),
    type,
    title,
    payload,
    isEntering: true,
    isLeaving: false,
    resolve: resolver,
    onSuccessCallback
  }

  modalStack.value.unshift(newModal)

  // If non-blocking (default), release the caller context immediately
  if (!waitForResult) {
    return Promise.resolve(true)
  }
  
  return completionPromise
}

  /**
   * Triggers the topmost exit animation frame
   */
  function pop() {
    if (stackDepth.value > 0) {
      const top = modalStack.value[0]
    if (top) { // Safe Guard Check
        top.isLeaving = true
        top.isEntering = false
      }
      if (stackDepth.value === 1) {
        unlockBodyScroll()
      }
    }
  }

  /**
   * Resolves the top modal with 'false' and pops it out
   */
  function cancel() {
    if (stackDepth.value > 0) {
      const top = modalStack.value[0]
      if (top) { // Safe Guard Check
        if (top.resolve) top.resolve(false) // C#: completion.TrySetResult(false)
        pop()
      }
   
    }
  }

  /**
   * Forces close on all active layer stacks instantly
   */
  function closeAll() {
    if (stackDepth.value === 0) return

    modalStack.value.forEach(m => {
      if (m.resolve) m.resolve(false)
    })

    modalStack.value = []
    unlockBodyScroll()
  }

  /**
   * Drops the modal layer directly underneath the current active foreground modal
   */
  /**
   * Drops the modal layer directly underneath the current active foreground modal safely
   */
  async function popPrevious() {
    // 1. Guard the length early
    if (stackDepth.value < 2) return

    const previousModal = modalStack.value[1]
    
    // 2. TYPE GUARD: Prove to TypeScript that previousModal is NOT undefined
    if (!previousModal) return

    // Allow animation paint ticks to clear safely
    await nextTick()
    
    // TypeScript is happy now because previousModal is strictly a 'ModalInstance' here
    remove(previousModal)
  }

  function popAncestors(commentId: string): void {
  // 🎯 Clean, continuous rollback loop from the top of the stack
  while (modalStack.value.length > 0) {
    const topIdx = modalStack.value.length - 1;
    const top = modalStack.value[topIdx];

    if (!top) break;

    // The moment the active top layer matches our target context, we stop rolling back
    if (top.payload && top.payload.commentId === commentId) {
      break;
    }

    // Otherwise, slice away the unnecessary top frame and keep dropping down
    remove(top);
  }
}


  function isActiveComment(commentId: string): boolean {
    if (stackDepth.value === 0) return false
    const top = modalStack.value[0]
    return top && top.payload && top.payload.commentId === commentId
  }

  /**
   * Physical destruction and execution cleanup worker
   */
  function remove(modal: ModalInstance) {
    const index = modalStack.value.findIndex(m => m.id === modal.id)
    if (index !== -1) {
      // Resolve the parent's await thread loop task context assignment
      if (modal.resolve) modal.resolve(true)
      
      // Mutate the array slice
      modalStack.value.splice(index, 1)

      if (stackDepth.value === 0) {
        unlockBodyScroll()
      }
    }
  }

  // --- Browser DOM Interops ---
  function lockBodyScroll() {
    document.body.style.overflow = 'hidden'
  }

  function unlockBodyScroll() {
    document.body.style.overflow = ''
  }

  return {
    modalStack,
    activeModal,
    isOpen,
    isContainerOpen,
    stackDepth,
    push,
    pop,
    cancel,
    closeAll,
    popPrevious,
    popAncestors,
    isActiveComment,
    remove
  }
})