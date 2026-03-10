/**
 * @composable useWebSocket
 * @description Mock WebSocket composable for real-time queue updates.
 * In production this would connect to a WebSocket server.
 * Currently provides a mock interface for development.
 */
import { ref } from 'vue'

/**
 * @param {string} _url - WebSocket URL (unused in mock)
 * @returns {Object} WebSocket composable with connection state and message handlers.
 */
export function useWebSocket(_url) {
  const isConnected = ref(false)
  const lastMessage = ref(null)

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
  function send(data) {
    lastMessage.value = data
  }

  return { isConnected, lastMessage, connect, disconnect, send }
}
