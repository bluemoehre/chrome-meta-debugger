import { Message } from 'types/Message'
import { Meta, MetaItem } from 'types/Meta'
import { HEAD_ELEMENT_SELECTOR, MSG_ACTION_UPDATE, PORT_NAME } from 'config/defaults'
import { metaConfig } from 'config/meta'

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
 * Returns the given object but without the excluded keys
 **/
function filterAttributes(attributes: NamedNodeMap, exclude: string[] = []): Map<string, string> {
  const result = Object.create(null)

  Array.prototype.slice.call(attributes).forEach((attribute) => {
    if (exclude.indexOf(attribute.name) < 0) {
      result[attribute.name] = attribute.value
    }
  })

  return result
}

/**
 * Returns a list of objects representing the page's meta information.
 */
function getPageMeta(): Meta {
  const result: Meta = []
  const headElements = document.querySelectorAll(HEAD_ELEMENT_SELECTOR)

  for (const [index, headElement] of headElements.entries()) {
    const attributeMappers = metaConfig[headElement.tagName]

    for (const mapper of attributeMappers) {
      if (mapper.keyAttribute == null || mapper.keyAttribute in headElement.attributes) {
        let tagName = headElement.tagName.toLowerCase()
        let key: MetaItem['key']
        let value: MetaItem['value']

        // determine key
        switch (mapper.keyNameFrom) {
          case 'tagName':
            key = tagName
            break
          case 'tagValue':
            key = headElement.textContent ?? ''
            break
          case 'attrName':
            key = headElement.getAttributeNode(mapper.keyAttribute!)!.name
            break
          case 'attrValue':
            key = headElement.getAttributeNode(mapper.keyAttribute!)!.value
            break
        }

        // determine value
        if (mapper.valueAttribute && mapper.valueAttribute in headElement.attributes) {
          value = headElement.getAttribute(mapper.valueAttribute!)!
        } else {
          value = headElement.textContent ?? ''
        }

        result.push({
          idx: index,
          key,
          tag: tagName,
          value,
          valueLink: headElement.getAttribute('href'),
          attributes: filterAttributes(headElement.attributes, [mapper.keyAttribute!, mapper.valueAttribute!]),
        })

        break
      }
    }
  }

  return result
}

/**
 * Mutation handler for the document head
 */
function handleMutation(mutations: MutationRecord[], observer: MutationObserver): void {
  // console.log('DevTools:Meta', 'DOM mutation detected')
  if (currentPort) {
    sendMessage(currentPort, { action: MSG_ACTION_UPDATE, data: getPageMeta() })
  }
}

/**
 * Message handler for incoming messages from devtools panel
 **/
function handleMessage(message: any, port: chrome.runtime.Port): void {
  // console.log('DevTools:Meta', 'received message', { message, port: port.name, sender: port.sender })
  switch (message.action) {
    case MSG_ACTION_UPDATE:
      sendMessage(port, { action: MSG_ACTION_UPDATE, data: getPageMeta() })
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
    sendMessage(currentPort, { action: MSG_ACTION_UPDATE, data: getPageMeta() })
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
