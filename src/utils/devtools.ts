import { TagIndex } from 'types/Meta'

/** ID of a tab */
export type TabID = number

/**
 * Returns the tab ID for the current DevTools session
 */
export function getInspectedTabId(): TabID {
  return chrome.devtools.inspectedWindow.tabId
}

/**
 * Injects the DevTools script into the tab
 */
export function injectDevtools(tabId: TabID): Promise<TabID> {
  return new Promise((resolve) => {
    chrome.scripting.executeScript(
      {
        target: { tabId },
        files: ['content-script.js'],
      },
      function () {
        console.log('Content script executed', { tabId })
        resolve(tabId)
      }
    )
  })
}

/**
 * Opens the native Elements panel and points to the head element of the document at the specified position.
 */
export function inspectHeadElement(index: TagIndex) {
  chrome.devtools.inspectedWindow.eval(`inspect(document.head.children[${index}])`)
}
