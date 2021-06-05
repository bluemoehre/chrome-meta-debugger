/**
 * Active message ports
 * @type {Object.<String, Port>}
 */
var ports = {}

/**
 * Injects the devTools to given tabId
 * @param {number} tabId
 */
function injectDevtools(tabId) {
  chrome.tabs.executeScript(tabId, { file: 'js/devtools.js', runAt: 'document_start' }, function () {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message)
      ports[tabId].postMessage({
        action: 'error',
        error: 'Could not access metadata on this page. This may be a result of security restrictions.',
      })
    } else {
      ports[tabId].postMessage({
        action: 'refresh',
      })
    }
  })
}

// ---------- bind events ----------

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  console.log('tabUpdated', tabId)
  if (tabId in ports) {
    injectDevtools(tabId)
  }
})

// ---------- messaging ----------

// Receive message from content script and relay to the devTools page for the current tab
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log('got message', message, 'from', sender)

  // Messages from content scripts should have sender.tab set
  if (sender.tab) {
    if (sender.tab.id in ports) {
      console.info('forwarding message', message, 'from', sender.url, 'to tab', sender.tab.id)
      ports[sender.tab.id].postMessage(message)
    } else {
      console.warn('tab', sender.tab.id, 'has no active ports')
    }
  }
})

chrome.runtime.onConnect.addListener(function (port) {
  // The original connection event doesn't include the tab ID of the DevTools page, so we need to send it explicitly.
  port.onMessage.addListener(function (message, sender) {
    switch (message['action']) {
      case 'init':
        console.log('got message', message, 'from', port.name)
        console.log('connect port for tab', message['tabId'])
        ports[message['tabId']] = port
        port.onDisconnect.addListener(function () {
          console.log('disconnect port for tab', message['tabId'])
          delete ports[message['tabId']]
        })
        injectDevtools(message['tabId'])
        break
      default:
        console.log('forwarding message', message, 'from', port.name)
        chrome.tabs.sendMessage(
          message['tabId'],
          {
            action: message['action'],
            data: message['data'],
          },
          function (response) {
            console.info('got response', response)
            if (response === undefined) return
            port.postMessage(response)
          }
        )
    }
  })
})
