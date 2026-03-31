/**
 * Generic utility for file operations: download and share.
 */

/**
 * Download a data URL or Blob as a file.
 */
export function downloadFile(dataUrl: string, filename: string): void {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}

/**
 * Attempt to share a file using the Web Share API.
 * Falls back to traditional download if sharing isn't supported or fails.
 */
export async function shareOrDownloadFile(
  dataUrl: string, 
  filename: string, 
  title: string, 
  text: string
): Promise<boolean> {
  const isWebShareSupported = 
    navigator.share && 
    navigator.canShare

  if (isWebShareSupported) {
    try {
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      const file = new File([blob], filename, { type: blob.type })

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title,
          text,
        })
        return true
      }
    } catch (err) {
      console.warn('[WebShare] Failed or cancelled:', err)
      // Fallback below
    }
  }

  // Traditional download fallback
  downloadFile(dataUrl, filename)
  return false
}
