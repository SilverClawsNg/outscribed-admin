import { ref, readonly } from 'vue'

// 🔑 Single Source of Truth for the storage key
const HINT_KEY = 'X-OUTSCRIBED-ADMIN-TOKEN-HINT'

// Private reactive state shared across this utility module
const _isLoggedHint = ref(!!localStorage.getItem(HINT_KEY))

/**
 * 🔒 SYNCHRONOUS GUARD
 * Use this inside route guards, lifecycle hooks, or standard JS functions 
 * where you need an instantaneous, non-reactive baseline truth check.
 */
export function checkIsLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem(HINT_KEY)
}

/**
 * 🔄 REACTIVE USER HINT LOOKUP
 * Use this directly inside component setups or template bindings.
 * Returns a read-only ref so components can't accidentally mutate disk state.
 */
export function useLoginHint() {
  return readonly(_isLoggedHint)
}

export function setLoginHint() {
  localStorage.setItem(HINT_KEY, 'true')
  _isLoggedHint.value = true // Sync local tab memory instantly
}

export function clearLoginHint() {
  localStorage.removeItem(HINT_KEY)
  _isLoggedHint.value = false // Sync local tab memory instantly
}


// 🌐 MULTI-TAB FIREWALL
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    // Sync if our specific key is mutated, or if the entire storage was cleared
    if (event.key === HINT_KEY || event.key === null) {
       _isLoggedHint.value = checkIsLoggedIn()
    }
  })
  }
