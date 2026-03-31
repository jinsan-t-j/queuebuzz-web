import { ref } from 'vue'
import { toPng } from 'html-to-image'
import { useToast } from '@/composables/useToast'
import { shareOrDownloadFile } from '@/utils/file.util'

/**
 * Composable for capturing a DOM element as an image.
 */
export function useCapture() {
  const { showToast } = useToast()
  const isCapturing = ref(false)
  const hasCaptured = ref(false)

  /**
   * Capture a target element and save/share it.
   */
  async function captureElement(
    elementId: string, 
    filename: string, 
    shareData?: { title: string; text: string }
  ) {
    const element = document.getElementById(elementId)
    if (!element) {
      showToast('Capture target not found', { type: 'error' })
      return
    }

    isCapturing.value = true
    try {
      // 1. Ensure fonts are fully loaded
      if ('fonts' in document) {
        await document.fonts.ready
      }

      // 2. Extra delay for rendered components like QR inside the capture template
      await new Promise((r) => setTimeout(r, 600))

      const dataUrl = await toPng(element, {
        backgroundColor: '#F7F3EE', // bg-sand
        pixelRatio: 2,
        cacheBust: true,
        style: {
          transform: 'scale(1)',
          margin: '0',
        },
      })

      if (shareData) {
        const shared = await shareOrDownloadFile(
          dataUrl,
          filename,
          shareData.title,
          shareData.text
        )
        if (shared) {
          showToast('Image shared successfully', { type: 'success' })
        } else {
          showToast('Download started', { type: 'success' })
        }
      } else {
        const { downloadFile } = await import('@/utils/file.util')
        downloadFile(dataUrl, filename)
        showToast('Download started', { type: 'success' })
      }

      hasCaptured.value = true
    } catch (err: any) {
      console.error('[Capture] Error:', err)
      
      // Fallback: Skip fonts if it's a common rendering error
      if (err.message?.includes('font') || err.message?.includes('trim')) {
        try {
          const dataUrlFallback = await toPng(element, {
            backgroundColor: '#F7F3EE',
            pixelRatio: 1,
            skipFonts: true,
          })
          const { downloadFile } = await import('@/utils/file.util')
          downloadFile(dataUrlFallback, filename)
          hasCaptured.value = true
          showToast('Download started (fallback)', { type: 'success' })
          return
        } catch (fallbackErr) {
          console.error('[Capture] Fallback failed:', fallbackErr)
        }
      }

      showToast('Action failed — check browser permissions', { type: 'error' })
    } finally {
      isCapturing.value = false
    }
  }

  return { isCapturing, hasCaptured, captureElement }
}
