import { Meta } from 'types/Meta'
import {
  HEAD_ELEMENT_SELECTOR,
  IGNORED_DUPLICATE_KEYS,
  MARK_CHAR,
  MAX_UNMATCHED_VALUE_LENGTH,
  MSG_ACTION_ERROR,
  MSG_ACTION_UPDATE,
  PORT_NAME,
} from 'config/defaults'
import { getTemplate, htmlEncode, replacePlaceholders } from 'utils/lib'

/** Tab ID for which the devtools was opened */
let currentTabId: number = chrome.devtools.inspectedWindow.tabId

/** Port to communicate with the devtools panel */
let currentPort: chrome.runtime.Port | null = null

/** List of the page's current meta information */
let currentMeta: Meta = []

let filterForm: HTMLFormElement
let filterInput: HTMLInputElement
let filterClearButton: HTMLButtonElement
let filterReloadButton: HTMLButtonElement
let filterFlagSearchKeys: HTMLInputElement
let filterFlagSearchValues: HTMLInputElement
let metaList: HTMLElement
let metaListItemTemplate: string
let metaListItemAttributeTemplate: string
let notificationList: HTMLElement
let notificationWarningTemplate: string
let statusBar: HTMLElement
let itemCount: HTMLElement
let resultCount: HTMLElement
let statusTimeout: number

/**
 * Regular Expression for URLs
 * @see https://gist.github.com/dperini/729294
 */
// prettier-ignore
const rxUrl = new RegExp(
  // protocol identifier
  "(?:(?:[a-z-]+:)?//)" +
  // user:pass authentication
  "(?:\\S+(?::\\S*)?@)?" +
  "(?:" +
  // IP address exclusion
  // private & local networks
  "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
  "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
  "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
  // IP address dotted notation octets
  // excludes loopback network 0.0.0.0
  // excludes reserved space >= 224.0.0.0
  // excludes network & broadcast addresses
  // (first & last IP address of each class)
  "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
  "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
  "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
  "|" +
  // host name
  "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
  // domain name
  "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
  // TLD identifier
  "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
  // TLD may end with dot
  "\\.?" +
  ")" +
  // port number
  "(?::\\d{2,5})?" +
  // resource path
  "(?:[/?#][\\S" + MARK_CHAR + "]*)?"
  ,
  "ig"
);

/**
 * Regular Expression to find all mark chars
 */
const rxMarkChar = new RegExp(MARK_CHAR, 'g')

/**
 * Link all URLs within a string
 */
function linkURLs(string: string): string {
  return string.replace(rxUrl, (match) => {
    return '<a href="' + stripWordMarks(match) + '" target="_blank">' + match + '</a>'
  })
}

/**
 * Truncates a string and adds ellipsis at the end
 */
function truncate(string: string, length: number): string {
  return string.length > length ? string.substring(0, length) + '…' : string
}

/**
 * Wraps words within string in special chars
 */
function markWords(string: string, words: Array<string> | null): string {
  if (words) {
    for (const word of words) {
      string = word.length
        ? string.replace(new RegExp('(' + word + ')', 'gi'), MARK_CHAR + '$1' + MARK_CHAR)
        : string
    }
  }

  return string
}

/**
 * Strips all mark chars from the given string
 */
function stripWordMarks(string: string): string {
  return string.replace(rxMarkChar, '')
}

/**
 * Converts marks added by markWords() to HTML tags
 */
function convertMarksToHtml(string: string): string {
  return string.replace(new RegExp(MARK_CHAR + '(.+?)' + MARK_CHAR, 'gm'), '<mark>$1</mark>')
}

/**
 * Rebuilds the meta list
 */
function refreshMetaList() {
  let filterString: string
  let filterRx: RegExp
  let distinctKeys: Array<string> = []
  let duplicateKeys: Array<string> = []
  /** HTML string array */
  let listItems: Array<string> = []

  filterString = filterInput.value
  filterRx = new RegExp(
    filterString
      // escape Regexp special chars
      .replace(/[\\^$*+?.()|[\]{}]/g, '\\$&')
      // split input by comma for multi filter
      .replace(/\s*,\s*(?=\S)/g, '|')
      // remove standalone comma at end
      .replace(/\s*,\s*$/, ''),
    'i'
  )

  for (const meta of currentMeta) {
    // mark duplicate meta, base and title definitions
    if (['meta', 'base', 'title'].includes(meta.tag)) {
      if (!distinctKeys.includes(meta.key)) {
        distinctKeys.push(meta.key)
      } else if (!IGNORED_DUPLICATE_KEYS.includes(meta.key) && !duplicateKeys.includes(meta.key)) {
        duplicateKeys.push(meta.key)
      }
    }

    // if filter is active find matches
    let keyMatches: RegExpMatchArray | null = null
    let valueMatches: RegExpMatchArray | null = null
    if (filterString) {
      if (filterFlagSearchKeys.checked) {
        keyMatches = meta.key.match(filterRx)
      }
      if (filterFlagSearchValues.checked) {
        valueMatches = meta.value.match(filterRx)
      }
    }

    // if this entry will get displayed
    if (!filterString || keyMatches || valueMatches) {
      // mark text matches and escape value
      const keyHtml = convertMarksToHtml(htmlEncode(markWords(meta.key, keyMatches)))

      // truncate value if it does not contain any filter match
      const valueText = valueMatches ? meta.value : truncate(meta.value, MAX_UNMATCHED_VALUE_LENGTH)
      // mark text matches, escape value and convert value to link if necessary
      const valueHtml = meta.valueLink
        ? `<a href="${meta.valueLink}" target="_blank">${convertMarksToHtml(
            htmlEncode(markWords(valueText, valueMatches))
          )}</a>`
        : convertMarksToHtml(linkURLs(htmlEncode(markWords(valueText, valueMatches))))

      const classNames: Array<string> = []
      // add warning class for duplicate keys
      if (duplicateKeys.includes(meta.key)) {
        classNames.push('warning')
      }
      // if value has a whitespace ratio of 1:25 else enable word-break
      if ((valueText.match(/([\s]+)/g) || []).length < valueText.length / 25) {
        classNames.push('break-value')
      }

      let attributesHtml = ''
      for (const [name, value] of Object.entries(meta.attributes)) {
        attributesHtml += replacePlaceholders(metaListItemAttributeTemplate, { name, value })
      }

      listItems.push(
        replacePlaceholders(
          metaListItemTemplate,
          {
            idx: meta.idx,
            class: classNames.join(' '),
            tag: meta.tag,
            key: keyHtml,
            value: valueHtml,
            attributes: attributesHtml,
          },
          false
        )
      )
    }
  }

  let notificationItems: Array<string> = []
  if (duplicateKeys.length) {
    notificationItems.push(
      replacePlaceholders(notificationWarningTemplate, {
        text: 'Duplicate keys found',
        search: duplicateKeys.join(', '),
      })
    )
  }

  notificationList.innerHTML = notificationItems.join('')
  metaList.innerHTML = listItems.join('')
  resultCount.innerHTML =
    listItems.length < currentMeta.length
      ? `${listItems.length} / ${currentMeta.length} items`
      : `${currentMeta.length} items`
}

/**
 * Inspect a HEAD element within the DevTools Elements panel
 * @param index - meta item index key
 */
function inspectInElementsPanel(index: number) {
  chrome.devtools.inspectedWindow.eval(`inspect($$('${HEAD_ELEMENT_SELECTOR}')[${index}])`)
}

/**
 * Injects the devTools to given tab
 */
function injectDevtools(tabId: number): Promise<number> {
  return new Promise((resolve) => {
    chrome.scripting.executeScript(
      {
        target: { tabId },
        files: ['content-script.js'],
      },
      function () {
        console.log('content script initialized', { tabId })
        resolve(tabId)
      }
    )
  })
}

/**
 * Connects to the content script in the related tab
 */
function connect(tabId: number): chrome.runtime.Port {
  currentPort = chrome.tabs.connect(tabId, { name: PORT_NAME })

  // handle disconnect
  currentPort.onDisconnect.addListener(() => {
    if (chrome.runtime.lastError) {
      console.info(chrome.runtime.lastError.message)
    }
    console.log('tab disconnected')
    currentPort = null
  })

  // listen for messages
  currentPort.onMessage.addListener((message, port) => {
    console.log('received message', { message, port })
    switch (message.action) {
      // case 'refresh':
      //   clearTimeout(statusTimeout)
      //   statusTimeout = setTimeout(() => {
      //     document.body.setAttribute('data-message', 'Waiting for metadata …')
      //     statusTimeout = setTimeout(() => {
      //       document.body.setAttribute('data-message', 'Timeout while getting metadata. A page reload may help.')
      //     }, 3000)
      //   }, 50)
      //   port?.postMessage({ action: ACTION_UPDATE })
      //   break
      case MSG_ACTION_UPDATE:
        clearTimeout(statusTimeout)
        document.body.removeAttribute('data-message')
        currentMeta = message.data
        refreshMetaList()
        break
      case MSG_ACTION_ERROR:
        clearTimeout(statusTimeout)
        document.body.setAttribute('data-message', message.error)
        break
      default:
        console.error('unknown action in message')
    }
  })

  return currentPort
}

// load templates & select elements & bind event handlers
document.addEventListener('DOMContentLoaded', () => {
  // detect color theme and add class to the document element
  if (chrome.devtools.panels.themeName === 'dark') {
    document.documentElement.classList.add('theme-dark')
  }

  filterForm = document.getElementById('filters') as HTMLFormElement
  metaList = document.getElementById('meta') as HTMLElement
  metaListItemTemplate = getTemplate('templateMetaItem') as string
  metaListItemAttributeTemplate = getTemplate('templateMetaItemAttribute') as string
  filterInput = filterForm.querySelector('input[name="filterString"]') as HTMLInputElement
  filterClearButton = filterForm.querySelector('button[name="clearFilter"]') as HTMLButtonElement
  filterReloadButton = filterForm.querySelector('button[name="reload"]') as HTMLButtonElement
  filterFlagSearchKeys = filterForm.querySelector('input[name="searchKeys"]') as HTMLInputElement
  filterFlagSearchValues = filterForm.querySelector('input[name="searchValues"]') as HTMLInputElement
  notificationList = document.getElementById('notifications') as HTMLElement
  notificationWarningTemplate = getTemplate('notificationWarning') as string
  statusBar = document.getElementById('statusBar') as HTMLElement
  resultCount = document.getElementById('resultCount') as HTMLElement

  filterForm.addEventListener('reset', () => {
    setTimeout(() => {
      refreshMetaList()
      filterInput.focus()
    }, 0)
  })

  filterInput.addEventListener('input', refreshMetaList)
  filterFlagSearchKeys.addEventListener('change', refreshMetaList)
  filterFlagSearchValues.addEventListener('change', refreshMetaList)
  filterClearButton.addEventListener('click', () => {
    filterInput.value = ''
    refreshMetaList()
  })
  filterReloadButton.addEventListener('click', () => {
    filterReloadButton.classList.add('_animate')
    setTimeout(() => {
      filterReloadButton.classList.remove('_animate')
    }, 1000)
    currentPort?.postMessage({ action: MSG_ACTION_UPDATE })
  })

  document.addEventListener('click', (evt) => {
    const link = (evt.target as HTMLElement).closest('a')
    if (link?.matches('a[href^="#!"]')) {
      const href = link.getAttribute('href')
      const matches = href?.match(/^#!(\w+)=(.*)$/)
      const action = matches?.[1]
      const value = matches?.[2]
      switch (action) {
        case 'inspect':
          if (value) inspectInElementsPanel(parseInt(value))
          else console.error('invalid link action value', value)
          break
        case 'searchKeys':
          filterFlagSearchKeys.checked = true
          filterFlagSearchValues.checked = false
          filterInput.value = value ?? ''
          refreshMetaList()
          break
        default:
          console.error('unknown link action', link.href)
      }
    }
  })
})

// automatically focus filter when user starts typing
// but not when Command (OSX) / CTRL (Win) is pressed to keep copy functionality
document.addEventListener('keydown', (evt) => {
  !evt.ctrlKey && !evt.metaKey && filterInput && filterInput.focus()
})

console.log('panel initialized')

// Handle tab updates (e.g. reload)
chrome.tabs.onUpdated.addListener((updatedTabId, changeInfo) => {
  // skip updates for other tabs
  if (updatedTabId !== currentTabId) return
  // skip updates which are pending
  if (changeInfo.status !== 'complete') return

  console.log('tab updated', { tabId: currentTabId, changeInfo })
  injectDevtools(currentTabId).then(connect)
})

injectDevtools(currentTabId).then(connect)
