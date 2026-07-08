import { onMounted, onUnmounted } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

function handleBeforeUnload(e: BeforeUnloadEvent) {
  e.preventDefault()
  // returnValue is deprecated in TS/standards, but still required by some browsers (e.g., Chrome)
  // to trigger the unload confirmation.
  ;(e as unknown as Record<string, unknown>).returnValue = ''
}

/**
 * Composable to prevent accidental navigation or page close by prompting the user.
 */
export function useLeaveGuard(
  message = 'Are you sure you want to leave this page?',
  shouldGuard: () => boolean = () => true,
) {
  onBeforeRouteLeave((to, from, next) => {
    if (!shouldGuard()) {
      next()
      return
    }
    const answer = window.confirm(message)
    if (answer) {
      next()
    } else {
      next(false)
    }
  })

  const handleUnload = (e: BeforeUnloadEvent) => {
    if (shouldGuard()) {
      handleBeforeUnload(e)
    }
  }

  onMounted(() => {
    window.addEventListener('beforeunload', handleUnload)
  })

  onUnmounted(() => {
    window.removeEventListener('beforeunload', handleUnload)
  })
}
