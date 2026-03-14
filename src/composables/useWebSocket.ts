/**
 * @composable useWebSocket
 * @description Mock WebSocket composable for real-time queue updates.
 * In production this would connect to a WebSocket server.
 * Currently provides a mock interface for development.
 */
import { ref } from 'vue'

export function useWebSocket<TMessage = unknown>(_url: string) {
  const isConnected = ref(false)
  const lastMessage = ref<TMessage | null>(null)

  /**
   * @description Simulates connecting to the WebSocket server.
   */
  function connect() {
    isConnected.value = true
  }

  /**
   * @description Simulates disconnecting from the WebSocket server.
   */
  function disconnect() {
    isConnected.value = false
    lastMessage.value = null
  }

  /**
   * @description Simulates sending a message through the WebSocket.
   * @param {Object} data - The message payload
   */
  function send(data: TMessage) {
    lastMessage.value = data
  }

  return { isConnected, lastMessage, connect, disconnect, send }
}
