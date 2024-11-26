import { Message } from 'types/Message'
import { PORT_NAME } from 'config/defaults'
import { getMeta } from 'utils/meta'

declare global {
  interface Window {
    __meta_debugger?: string
  }
}

/** Port to communicate with the devtools panel */
let currentPort: chrome.runtime.Port | null = null

/** Mutation observer to monitor the document head */
let currentObserver: MutationObserver | null = null

/**
 * Mutation handler for the document head
 */
function handleMutation(mutations: MutationRecord[], observer: MutationObserver): void {
  // console.log('DevTools:Meta', 'DOM mutation detected')
  if (currentPort) {
    sendMessage(currentPort, { type: 'data', data: getMeta(document.head) })
  }
}

/**
 * Message handler for incoming messages from devtools panel
 **/
function handleMessage(message: Message, port: chrome.runtime.Port): void {
  // console.log('DevTools:Meta', 'received message', { message, port: port.name, sender: port.sender })
  switch (message.type) {
    case 'refresh':
      sendMessage(port, { type: 'data', data: getMeta(document.head) })
      break
    default:
    // console.error('DevTools:Meta', 'unknown action "' + message.action + '" in message')
  }
}

/**
 * Sends current meta list to devtools panel
 */
function sendMessage(port: chrome.runtime.Port, message: Message) {
  try {
    // console.log('DevTools:Meta', 'sending message to panel', { message })
    port.postMessage(message)
  } catch (error) {
    // console.info('DevTools:Meta', 'sending message failed', error)
  }
}

/**
 * Returns a new mutation observer for the document head
 */
function createMutationObserver(target: Node, callback: MutationCallback): MutationObserver {
  const observer = new MutationObserver(callback)

  observer.observe(target, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true,
  })

  return observer
}

/**
 * Initiate monitoring and messaging
 */
function init(): void {
  // prevent double init
  if (window.__meta_debugger) return
  window.__meta_debugger = chrome.runtime.id
  // console.log('DevTools:Meta', 'content script injected')

  // handle connects from devtools panel
  chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== PORT_NAME) return
    // console.info('DevTools:Meta', 'panel connected', { port: port.name, sender: port.sender })
    currentPort = port

    // bind even listeners
    port.onMessage.addListener(handleMessage)

    // handle disconnect
    port.onDisconnect.addListener((port) => {
      // console.info('DevTools:Meta', 'panel disconnected', { port: port.name, sender: port.sender })
      currentPort = null
    })

    // initially send the current data
    sendMessage(currentPort, { type: 'data', data: getMeta(document.head) })
  })

  // when document is fully loaded start monitoring the HEAD
  new Promise<void>((resolve) => {
    if (document.readyState === 'complete') {
      resolve()
    } else {
      document.addEventListener('DOMContentLoaded', () => resolve())
    }
  }).then(() => {
    currentObserver = createMutationObserver(document.head, handleMutation)
  })
}

init()
