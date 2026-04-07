import { ref, onUnmounted } from 'vue'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'

/**
 * @composable useQrScanner
 * @description Manages the lifecycle of a QR code scanner using html5-qrcode.
 */
export function useQrScanner() {
  const scanner = ref<Html5Qrcode | null>(null)
  const isScanning = ref(false)
  const error = ref<string | null>(null)

  /**
   * Initialize and start the scanner on a specific element ID
   */
  async function startScanner(
    elementId: string,
    onResult: (text: string) => void,
    config = { fps: 10, qrbox: { width: 250, height: 250 } },
  ) {
    try {
      if (scanner.value) {
        await stopScanner()
      }

      scanner.value = new Html5Qrcode(elementId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      })

      isScanning.value = true
      error.value = null

      await scanner.value.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          onResult(decodedText)
        },
        () => {
          // Failure to detect QR in frame is normal, ignore
        },
      )
    } catch (err: unknown) {
      const errorTyped = err as { message?: string }
      error.value =
        errorTyped.message ||
        'Failed to start camera. Please ensure camera permissions are granted.'
      isScanning.value = false
      throw err
    }
  }

  /**
   * Stop and cleanup the scanner
   */
  async function stopScanner() {
    if (scanner.value && isScanning.value) {
      try {
        await scanner.value.stop()
        scanner.value = null
        isScanning.value = false
      } catch {
        // Failed to stop scanner
      }
    }
  }

  onUnmounted(() => {
    stopScanner()
  })

  return {
    isScanning,
    error,
    startScanner,
    stopScanner,
  }
}
