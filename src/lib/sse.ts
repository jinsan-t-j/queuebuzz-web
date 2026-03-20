export type SseConnectionState = 'idle' | 'connecting' | 'open' | 'error'

export interface SseClientOptions {
  url: string
  withCredentials?: boolean
  onOpen?: () => void
  onError?: (event: Event) => void
  onMessage?: (payload: unknown, event: MessageEvent<string>) => void
  onParseError?: (error: Error, event: MessageEvent<string>) => void
  events?: Record<string, (payload: unknown, event: MessageEvent<string>) => void>
}

export interface SseClient {
  connect: () => void
  disconnect: () => void
  isActive: () => boolean
  isConnected: () => boolean
}

function parseEventPayload(event: MessageEvent<string>) {
  if (!event.data) {
    return null
  }

  return JSON.parse(event.data)
}

export function createSseClient(options: SseClientOptions): SseClient {
  let source: EventSource | null = null
  const listeners = new Map<string, (event: MessageEvent<string>) => void>()

  function removeListeners() {
    if (!source) {
      return
    }

    listeners.forEach((listener, eventName) => {
      source?.removeEventListener(eventName, listener as EventListener)
    })
    listeners.clear()
  }

  function disconnect() {
    removeListeners()
    source?.close()
    source = null
  }

  function connect() {
    disconnect()

    source = new EventSource(options.url, {
      withCredentials: options.withCredentials ?? false,
    })

    source.onopen = () => {
      options.onOpen?.()
    }

    source.onerror = (event) => {
      options.onError?.(event)
    }

    source.onmessage = (event) => {
      try {
        const payload = parseEventPayload(event)
        options.onMessage?.(payload, event)
      } catch (error) {
        options.onParseError?.(error as Error, event)
      }
    }

    Object.entries(options.events ?? {}).forEach(([eventName, handler]) => {
      const listener = (event: MessageEvent<string>) => {
        try {
          const payload = parseEventPayload(event)
          handler(payload, event)
        } catch (error) {
          options.onParseError?.(error as Error, event)
        }
      }

      listeners.set(eventName, listener)
      source?.addEventListener(eventName, listener as EventListener)
    })
  }

  return {
    connect,
    disconnect,
    isActive: () => source !== null && source.readyState !== EventSource.CLOSED,
    isConnected: () => source?.readyState === EventSource.OPEN,
  }
}
