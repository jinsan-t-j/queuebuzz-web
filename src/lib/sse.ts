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

interface SseEventFrame {
  event: string
  data: string
  id?: string
  retry?: number
}

const DEFAULT_RETRY_DELAYS_MS = [1000, 2000, 5000, 10000]
const CONTENT_TYPE_EVENT_STREAM = 'text/event-stream'

function normalizeChunk(value: string): string {
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

function parseField(line: string): { field: string; value: string } {
  const separatorIndex = line.indexOf(':')
  if (separatorIndex === -1) {
    return { field: line, value: '' }
  }

  const field = line.slice(0, separatorIndex)
  const rawValue = line.slice(separatorIndex + 1)
  const value = rawValue.startsWith(' ') ? rawValue.slice(1) : rawValue

  return { field, value }
}

function parseEventBlock(block: string): SseEventFrame | null {
  if (!block.trim()) {
    return null
  }

  let event = 'message'
  let id: string | undefined
  let retry: number | undefined
  const dataLines: string[] = []

  for (const line of block.split('\n')) {
    if (!line || line.startsWith(':')) {
      continue
    }

    const { field, value } = parseField(line)

    if (field === 'event') {
      event = value || 'message'
      continue
    }

    if (field === 'data') {
      dataLines.push(value)
      continue
    }

    if (field === 'id') {
      id = value
      continue
    }

    if (field === 'retry') {
      const parsedRetry = Number.parseInt(value, 10)
      if (!Number.isNaN(parsedRetry) && parsedRetry >= 0) {
        retry = parsedRetry
      }
    }
  }

  if (dataLines.length === 0) {
    return null
  }

  return {
    event,
    data: dataLines.join('\n'),
    id,
    retry,
  }
}

export function createSseClient(options: SseClientOptions): SseClient {
  let controller: AbortController | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let isRequestActive = false
  let isOpen = false
  let isManuallyDisconnected = false
  let reconnectAttempt = 0
  let lastEventId = ''
  let serverRetryDelayMs: number | null = null

  function clearReconnectTimer() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  function abortActiveRequest() {
    controller?.abort()
    controller = null
  }

  function markClosed() {
    isOpen = false
    isRequestActive = false
  }

  function getReconnectDelay() {
    if (serverRetryDelayMs != null) {
      return serverRetryDelayMs
    }

    return DEFAULT_RETRY_DELAYS_MS[Math.min(reconnectAttempt, DEFAULT_RETRY_DELAYS_MS.length - 1)]
  }

  function scheduleReconnect() {
    if (isManuallyDisconnected || reconnectTimer) {
      return
    }

    const delay = getReconnectDelay()
    reconnectAttempt += 1

    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      void connect()
    }, delay)
  }

  function handleIncomingEvent(frame: SseEventFrame) {
    if (frame.id !== undefined) {
      lastEventId = frame.id
    }

    if (frame.retry !== undefined) {
      serverRetryDelayMs = frame.retry
    }

    try {
      const payload = keysToCamelCase(JSON.parse(frame.data))

      if (options.events?.[frame.event]) {
        options.events[frame.event](payload, frame.data)
        return
      }

      options.onMessage?.(payload, { event: frame.event, data: frame.data })
    } catch (error) {
      options.onParseError?.(error as Error, frame.data)
    }
  }

  async function readStream(response: Response) {
    if (!response.body) {
      throw new Error('No response body')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { value, done } = await reader.read()

      if (done) {
        break
      }

      buffer += normalizeChunk(decoder.decode(value, { stream: true }))
      const eventBlocks = buffer.split('\n\n')
      buffer = eventBlocks.pop() || ''

      for (const block of eventBlocks) {
        const frame = parseEventBlock(block)
        if (frame) {
          handleIncomingEvent(frame)
        }
      }
    }

    buffer += normalizeChunk(decoder.decode())

    const trailingFrame = parseEventBlock(buffer)
    if (trailingFrame) {
      handleIncomingEvent(trailingFrame)
    }
  }

  async function connect() {
    clearReconnectTimer()
    abortActiveRequest()

    controller = new AbortController()
    isManuallyDisconnected = false
    isRequestActive = true
    isOpen = false

    try {
      const headers: Record<string, string> = {
        Accept: CONTENT_TYPE_EVENT_STREAM,
        'Cache-Control': 'no-cache',
      }

      if (lastEventId) {
        headers['Last-Event-ID'] = lastEventId
      }

      const response = await fetch(options.url, {
        signal: controller.signal,
        credentials: options.withCredentials ? 'include' : 'omit',
        cache: 'no-store',
        headers,
      })

      if (!response.ok) {
        throw { status: response.status, message: `SSE handshake failed with ${response.status}` }
      }

      const contentType = response.headers.get('content-type') || ''
      if (!contentType.toLowerCase().includes(CONTENT_TYPE_EVENT_STREAM)) {
        throw new Error(`Invalid SSE content-type: ${contentType || 'missing'}`)
      }

      isOpen = true
      reconnectAttempt = 0
      options.onOpen?.()

      await readStream(response)

      if (!isManuallyDisconnected) {
        throw new Error('SSE stream closed unexpectedly')
      }
    } catch (error: unknown) {
      const normalizedError = error as { name?: string; status?: number; message?: string }

      if (normalizedError.name === 'AbortError') {
        markClosed()
        return
      }

      markClosed()
      options.onError?.({
        status: normalizedError.status,
        message: normalizedError.message || 'Unknown SSE error',
      })
      scheduleReconnect()
      return
    }

    markClosed()
  }

  function disconnect() {
    isManuallyDisconnected = true
    clearReconnectTimer()
    abortActiveRequest()
    markClosed()
  }

  return {
    connect,
    disconnect,
    isActive: () => isRequestActive,
    isConnected: () => isOpen,
  }
}
