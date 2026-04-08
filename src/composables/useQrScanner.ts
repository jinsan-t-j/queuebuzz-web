import { ref, onUnmounted } from 'vue'

interface QrCodeScanner {
  start: (
    cameraIdOrConfig: { facingMode: string },
    config: { fps: number; qrbox: { width: number; height: number } },
    onSuccess: (text: string) => void,
    onFailure: () => void,
  ) => Promise<void>
  stop: () => Promise<void>
}

/**
 * @composable useQrScanner
 * @description Manages the lifecycle of a QR code scanner using html5-qrcode.
 */
export function useQrScanner() {
  const scanner = ref<QrCodeScanner | null>(null)
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

      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode')

      const instance = new Html5Qrcode(elementId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      })

      scanner.value = instance as unknown as QrCodeScanner
      isScanning.value = true
      error.value = null

      await instance.start(
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
    window.removeEventListener('pagehide', stopScanner)
  })

  // stop camera when page is hidden/navigated away
  window.addEventListener('pagehide', stopScanner)

  return {
    isScanning,
    error,
    startScanner,
    stopScanner,
  }
}
