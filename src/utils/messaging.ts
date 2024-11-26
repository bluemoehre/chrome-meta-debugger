import { PORT_NAME } from 'config/defaults'

/** Port to communicate with the devtools panel */
export let currentPort: chrome.runtime.Port | null = null

/**
 * Connects to the content script in the related tab
 */
export function connect(tabId: number): chrome.runtime.Port {
  currentPort = chrome.tabs.connect(tabId, { name: PORT_NAME })
  console.log('Tab connected', { tabId })

  // handle disconnect
  currentPort.onDisconnect.addListener(() => {
    if (chrome.runtime.lastError) {
      console.info(chrome.runtime.lastError.message)
    }
    console.log('Tab disconnected', { tabId })
    currentPort = null
  })

  return currentPort
}

/**
 * Returns a chainable callback for connecting the handler to a port.
 */
export function bind(handler: (message: any, port: chrome.runtime.Port) => void) {
  return (port: chrome.runtime.Port) => port.onMessage.addListener(handler)
}

/**
 * Sends a message to the connected tab
 * @throws Error if not connected
 */
export function sendMessage(message: any, port = currentPort) {
  if (!port) throw new Error('Not connected to tab.')
  port.postMessage(message)
}

/**
 * Registers a handler that receives messages from the connected tab
 * @throws Error if not connected
 */
export function receiveMessage(handler: (message: any, port: chrome.runtime.Port) => void, port = currentPort) {
  if (!port) throw new Error('Not connected to tab.')
  port.onMessage.addListener(handler)
}
