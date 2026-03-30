import { keysToCamelCase } from '@/utils/caseConvert'

export type SseConnectionState = 'idle' | 'connecting' | 'open' | 'error'

export interface SseClientOptions {
  url: string
  withCredentials?: boolean
  onOpen?: () => void
  onError?: (error: { status?: number; message: string }) => void
  onMessage?: (payload: unknown, event: { event: string; data: string }) => void
  onParseError?: (error: Error, payload: string) => void
  events?: Record<string, (payload: unknown, data: string) => void>
}

export interface SseClient {
  connect: () => void
  disconnect: () => void
  isActive: () => boolean
  isConnected: () => boolean
}

export function createSseClient(options: SseClientOptions): SseClient {
  let controller: AbortController | null = null
  let isRequestActive = false
  let isOpen = false

  function disconnect() {
    controller?.abort()
    controller = null
    isRequestActive = false
    isOpen = false
  }

  async function connect() {
    disconnect()
    controller = new AbortController()
    isRequestActive = true

    try {
      const response = await fetch(options.url, {
        signal: controller.signal,
        credentials: options.withCredentials ? 'include' : 'omit',
        headers: {
          'Accept': 'text/event-stream',
        },
      })

      if (!response.ok) {
        throw { status: response.status, message: `SSE handshake failed with ${response.status}` }
      }

      if (!response.body) {
        throw { message: 'No response body' }
      }

      isOpen = true
      options.onOpen?.()

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split('\n\n')
        buffer = events.pop() || ''

        for (const eventBlock of events) {
          const lines = eventBlock.split('\n')
          let eventType = 'message'
          let eventData = ''

          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventType = line.replace('event:', '').trim()
            } else if (line.startsWith('data:')) {
              eventData = line.replace('data:', '').trim()
            }
          }

          if (eventData) {
            try {
              const payload = keysToCamelCase(JSON.parse(eventData))

              if (options.events?.[eventType]) {
                options.events[eventType](payload, eventData)
              } else {
                options.onMessage?.(payload, { event: eventType, data: eventData })
              }
            } catch (err) {
              options.onParseError?.(err as Error, eventData)
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return

      isOpen = false
      options.onError?.({
        status: err.status,
        message: err.message || 'Unknown SSE error'
      })
    } finally {
      isRequestActive = false
    }
  }

  return {
    connect,
    disconnect,
    isActive: () => isRequestActive,
    isConnected: () => isOpen,
  }
}
