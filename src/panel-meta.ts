import { Message } from 'types/Message'
import { Meta, MetaItem } from 'types/Meta'
import { MetaReport, SeoReport } from 'types/Reports'
import { MAX_UNMATCHED_VALUE_LENGTH } from 'config/defaults'
import { ogRules } from 'config/rules/open-graph'
import { tagRules } from 'config/rules/tags'
import { getInspectedTabId, injectDevtools, inspectHeadElement } from 'utils/devtools'
import { convertMarksToHtml, markWords, stripWordMarks } from 'utils/marker'
import { bind, connect, sendMessage } from 'utils/messaging'
import { findDuplicates } from 'utils/meta'
import { validateMeta } from 'utils/rules'
import { validateSeo } from 'utils/seo'
import { getTemplate, escapeHtml, render } from 'utils/templating'
import { linkUrls, truncate } from 'utils/text'
import { IconElement } from 'elements/icon'

// define custom elements
customElements.define('svg-icon', IconElement)

/** Tab ID to which the current DevTools session is linked */
let currentTabId = getInspectedTabId()

/** List of the page's current meta information */
let currentMeta: Meta = []

let toolbar: HTMLElement
let filterForm: HTMLFormElement
let filterInput: HTMLInputElement
let filterClearButton: HTMLButtonElement
let filterFlagSearchKeys: HTMLInputElement
let filterFlagSearchValues: HTMLInputElement
let validationForm: HTMLFormElement
let validateCodeToggle: HTMLInputElement
let validateMetaToggle: HTMLInputElement
let validateSeoToggle: HTMLInputElement
let reloadButton: HTMLButtonElement
let metaTable: HTMLTableElement
let metaList: HTMLElement
let metaListColumnWidth1: HTMLInputElement
let metaListItemTemplate: string
let metaListItemAttributeTemplate: string
let metaListItemIssuesTemplate: string
let metaListItemErrorTemplate: string
let metaListItemWarningTemplate: string
let metaListItemErrorToggleTemplate: string
let metaListItemWarningToggleTemplate: string
let issuesList: HTMLElement
let notificationList: HTMLElement
let notificationListItemWarningTemplate: string
let notificationListItemErrorTemplate: string
let statusBar: HTMLElement
let resultCount: HTMLElement
let charCount: HTMLElement
let statusTimeout: number
let settingsDialog: HTMLDialogElement
let settingsDialogOpenButton: HTMLButtonElement
let settingsDialogCloseButton: HTMLButtonElement

/**
 * Assigns all required HTML elements to the corresponding variables
 */
function initElements() {
  toolbar = document.getElementById('toolbar') as HTMLElement
  reloadButton = toolbar.querySelector('button[name="reload"]') as HTMLButtonElement

  filterForm = document.getElementById('filter') as HTMLFormElement
  filterInput = filterForm.querySelector('input[name="filterString"]') as HTMLInputElement
  filterClearButton = filterForm.querySelector('button[name="clear"]') as HTMLButtonElement
  filterFlagSearchKeys = filterForm.querySelector('input[name="searchKeys"]') as HTMLInputElement
  filterFlagSearchValues = filterForm.querySelector('input[name="searchValues"]') as HTMLInputElement

  validationForm = document.getElementById('validation') as HTMLFormElement
  validateCodeToggle = validationForm.querySelector('input[name="validateCode"]') as HTMLInputElement
  validateMetaToggle = validationForm.querySelector('input[name="validateMeta"]') as HTMLInputElement
  validateSeoToggle = validationForm.querySelector('input[name="validateSeo"]') as HTMLInputElement

  metaTable = document.getElementById('meta') as HTMLTableElement
  metaList = metaTable.querySelector('tbody') as HTMLElement
  metaListColumnWidth1 = document.querySelector('input[name="columnWidth-1"]') as HTMLInputElement
  metaListItemTemplate = getTemplate('metaItemTemplate') as string
  metaListItemAttributeTemplate = getTemplate('metaItemAttributeTemplate') as string
  metaListItemIssuesTemplate = getTemplate('metaItemIssuesTemplate') as string
  metaListItemErrorToggleTemplate = getTemplate('metaItemErrorToggleTemplate') as string
  metaListItemWarningToggleTemplate = getTemplate('metaItemWarningToggleTemplate') as string
  metaListItemErrorTemplate = getTemplate('metaItemErrorTemplate') as string
  metaListItemWarningTemplate = getTemplate('metaItemWarningTemplate') as string

  issuesList = document.getElementById('issues') as HTMLElement

  notificationList = document.getElementById('notifications') as HTMLElement
  notificationListItemErrorTemplate = getTemplate('notificationItemErrorTemplate') as string
  notificationListItemWarningTemplate = getTemplate('notificationItemWarningTemplate') as string

  statusBar = document.getElementById('statusBar') as HTMLElement
  resultCount = document.getElementById('resultCount') as HTMLElement
  charCount = document.getElementById('charCount') as HTMLElement

  settingsDialog = document.getElementById('settings') as HTMLDialogElement
  settingsDialogOpenButton = document.querySelector('button[name="settings"]') as HTMLButtonElement
  settingsDialogCloseButton = settingsDialog.querySelector('button[name="close"]') as HTMLButtonElement
}

/**
 * Rebuilds the meta list
 */
function refreshMetaList() {
  let filterString: string
  let filterRx: RegExp
  let duplicates: MetaItem[] | undefined
  let codeIssues: MetaReport = []
  let ogIssues: MetaReport = []
  let seoIssues: SeoReport = []
  const currentItems: Array<string> = []
  const missingItems: Array<string> = []
  const issueTooltips: Array<string> = []
  const issueSummary = []

  // find code issues
  if (validateCodeToggle.checked) {
    codeIssues = validateMeta(currentMeta, tagRules)
    if (codeIssues.length > 0) {
      issueSummary.push({
        severity: 'error',
        message: 'Code check failed',
        search: codeIssues
          .filter(({ meta }) => !!meta)
          .map(({ meta }) => meta!.key)
          .join(', '),
      })
    }
    duplicates = findDuplicates(currentMeta)
    if (duplicates.length > 0) {
      issueSummary.push({
        severity: 'warning',
        message: 'Duplicates found',
        search: Array.from(new Set(duplicates.map(({ key }) => key))).join(', '),
      })
    }
  }

  // find metadata issues
  if (validateMetaToggle.checked) {
    ogIssues = validateMeta(currentMeta, ogRules)
    if (ogIssues.length > 0) {
      issueSummary.push({
        severity: 'error',
        message: 'Meta check failed',
        search: ogIssues
          .filter(({ meta }) => !!meta)
          .map(({ meta }) => meta!.key)
          .join(', '),
      })
    }
  }

  // find SEO issues
  if (validateSeoToggle.checked) {
    seoIssues = validateSeo(currentMeta)
    if (seoIssues.length > 0) {
      issueSummary.push({
        severity: 'error',
        message: 'SEO check failed',
        search: seoIssues
          .filter(({ meta }) => !!meta)
          .map(({ meta }) => meta!.key)
          .join(', '),
      })
    }
  }

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

  // add missing items
  const issues = [...codeIssues, ...ogIssues, ...seoIssues]
  if (issues.length > 0) {
    const missingIssues = issues.filter(({ rule, meta }) => rule.required && meta === null)

    // missing items don't have valid indexes, so negative numbers are used
    let index = 1
    for (const issue of missingIssues) {
      index--

      // if filter is active find matches
      let keyMatches: RegExpMatchArray | null = null
      if (filterString) {
        if (filterFlagSearchKeys.checked) {
          keyMatches = issue.rule.key?.match(filterRx) ?? null
        }
      }

      // test if this entry will be omitted by filter
      if (!filterString || keyMatches) {
        missingItems.push(
          render(
            metaListItemTemplate,
            {
              idx: index.toString(),
              class: 'error',
              tag: issue.rule.tag,
              key: issue.rule.key ?? '',
              value: '',
              valueLength: '0',
              attributes: '',
              issues: render(metaListItemErrorToggleTemplate, { idx: index.toString() }),
            },
            false
          )
        )
      }

      issueTooltips.push(
        render(
          metaListItemIssuesTemplate,
          {
            idx: index.toString(),
            children: render(metaListItemErrorTemplate, { message: issue.message }),
          },
          false
        )
      )
    }
  }

  for (const meta of currentMeta) {
    const index = meta.idx.toString()

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

    // do all the complex stuff only if item is shown
    if (!filterString || keyMatches || valueMatches) {
      const hasDuplicate = duplicates?.includes(meta)
      const ogIssue = ogIssues?.find((issue) => issue.meta === meta)
      const seoIssue = seoIssues?.find((issue) => issue.meta === meta)
      const codeIssue = codeIssues?.find((issue) => issue.meta === meta)

      // mark text matches and escape value
      const keyHtml = convertMarksToHtml(escapeHtml(markWords(meta.key, keyMatches)))

      // truncate value if it does not contain any filter match
      const valueText = valueMatches ? meta.value : truncate(meta.value, MAX_UNMATCHED_VALUE_LENGTH)
      // mark text matches, escape value and convert value to link if necessary
      const valueHtml = meta.valueLink
        ? `<a href="${meta.valueLink}" target="_blank">${convertMarksToHtml(
            escapeHtml(markWords(valueText, valueMatches))
          )}</a>`
        : convertMarksToHtml(linkUrls(escapeHtml(markWords(valueText, valueMatches))))

      // find highest severity
      let issueToggleButtonHtml = ''
      const classNames: Array<string> = []
      if (codeIssue?.severity === 'error' || ogIssue?.severity === 'error' || seoIssue?.severity === 'error') {
        classNames.push('error')
        issueToggleButtonHtml = render(metaListItemErrorToggleTemplate, { idx: index })
      } else if (
        codeIssue?.severity === 'warning' ||
        ogIssue?.severity === 'warning' ||
        seoIssue?.severity === 'warning' ||
        hasDuplicate
      ) {
        classNames.push('warning')
        issueToggleButtonHtml = render(metaListItemWarningToggleTemplate, { idx: index })
      }
      // enable word-break if value has a whitespace ratio worse than 1:25
      if ((valueText.match(/([\s]+)/g) || []).length < valueText.length / 25) {
        classNames.push('break-value')
      }

      let attributesHtml = ''
      for (const [name, value] of Object.entries(meta.attributes)) {
        attributesHtml += render(metaListItemAttributeTemplate, { name, value })
      }

      let issues: Array<string> = []

      // render code issues
      if (codeIssue) {
        issues.push(
          render(codeIssue.severity === 'error' ? metaListItemErrorTemplate : metaListItemWarningTemplate, {
            idx: index,
            rule: 'Code',
            message: codeIssue.message,
          })
        )
      }
      if (hasDuplicate) {
        issues.push(
          render(metaListItemWarningTemplate, {
            idx: index,
            rule: 'Code',
            message: 'Element is duplicate',
          })
        )
      }

      // render og issues
      if (ogIssue) {
        issues.push(
          render(ogIssue.severity === 'error' ? metaListItemErrorTemplate : metaListItemWarningTemplate, {
            idx: index,
            rule: 'OpenGraph',
            message: ogIssue.message,
          })
        )
      }

      // render seo issues
      if (seoIssue) {
        issues.push(
          render(seoIssue?.severity === 'error' ? metaListItemErrorTemplate : metaListItemWarningTemplate, {
            idx: index,
            rule: 'SEO',
            message: seoIssue.message,
          })
        )
      }

      // TODO: migrate HTML to template / stylesheet
      let valueIssueHtml = ''
      if (seoIssue?.rule.min && meta.value.length < seoIssue.rule.min) {
        valueIssueHtml = `<small style="margin-left: 4px; font-weight:600; color:var(--warning-color)">${
          meta.value.length - seoIssue.rule.min
        }</small>`
      }
      if (seoIssue?.rule.safe && meta.value.length > seoIssue.rule.safe) {
        valueIssueHtml = `<small style="margin-left: 4px; font-weight:600; color:var(--warning-color)">+${
          meta.value.length - seoIssue.rule.safe
        }</small>`
      }
      if (seoIssue?.rule.max && meta.value.length > seoIssue.rule.max) {
        valueIssueHtml = `<small style="margin-left: 4px; font-weight:600; color:var(--error-color)">+${
          meta.value.length - seoIssue.rule.max
        }</small>`
      }

      currentItems.push(
        render(
          metaListItemTemplate,
          {
            idx: index,
            class: classNames.join(' '),
            tag: meta.tag,
            key: keyHtml,
            value: valueHtml + valueIssueHtml,
            valueLength: valueText.length.toString(),
            attributes: attributesHtml,
            issues: issueToggleButtonHtml,
          },
          false
        )
      )

      if (issues.length) {
        issueTooltips.push(render(metaListItemIssuesTemplate, { idx: index, children: issues.join('') }, false))
      }
    }
  }

  const notificationItems: Array<string> = []
  issueSummary.forEach((issue) => {
    notificationItems.push(
      render(issue.severity === 'error' ? notificationListItemErrorTemplate : notificationListItemWarningTemplate, {
        text: issue.message,
        search: issue.search,
      })
    )
  })

  notificationList.innerHTML = notificationItems.join('')
  metaList.innerHTML = missingItems.join('') + currentItems.join('')
  issuesList.innerHTML = issueTooltips.join('')
  resultCount.innerHTML =
    // existing count
    (currentItems.length < currentMeta.length
      ? `${currentItems.length} / ${currentMeta.length} items`
      : `${currentMeta.length} items`) +
    // missing count
    (missingItems.length ? ` (${missingItems.length} missing)` : '')

  updateColumnWidthInputs()
}

/**
 * Sync related inputs to current rendered with of columns
 */
function updateColumnWidthInputs() {
  const tableRect = metaTable.querySelector('colgroup')!.getBoundingClientRect()
  const colRect = metaTable.querySelector('col')!.getBoundingClientRect()
  const value = (100 / tableRect.width) * (colRect.width + colRect.left / 2)
  metaListColumnWidth1.value = value.toString()
}

/**
 * Processes messages from the browser tab
 */
function handleMessage(message: Message, port: chrome.runtime.Port) {
  console.log('received message', { message, port })

  switch (message.type) {
    // case 'init':
    //   clearTimeout(statusTimeout)
    //   statusTimeout = setTimeout(() => {
    //     document.body.setAttribute('data-message', 'Waiting for metadata …')
    //     statusTimeout = setTimeout(() => {
    //       document.body.setAttribute('data-message', 'Timeout while getting metadata. A page reload may help.')
    //     }, 3000)
    //   }, 50)
    //   sendMessage({ action: 'refresh' })
    //   break
    case 'data':
      clearTimeout(statusTimeout)
      document.body.removeAttribute('data-message')
      currentMeta = message.data
      refreshMetaList()
      break
    case 'error':
      clearTimeout(statusTimeout)
      document.body.setAttribute('data-message', message.error)
      break
    default:
      console.error('unknown action in message')
  }
}

// load templates & select elements & bind event handlers
document.addEventListener('DOMContentLoaded', () => {
  // detect color theme and add class to the document element
  if (chrome.devtools.panels.themeName === 'dark') {
    document.documentElement.classList.add('theme-dark')
  }

  initElements()

  reloadButton.addEventListener('click', () => {
    reloadButton.classList.add('_animate')
    setTimeout(() => {
      reloadButton.classList.remove('_animate')
    }, 1000)
    sendMessage({ type: 'refresh' })
  })

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

  validationForm.addEventListener('change', refreshMetaList)

  metaList.addEventListener('mouseover', (evt) => {
    const el = evt.target as HTMLElement
    if (el.nodeName === 'TH' || el.nodeName === 'TD') {
      const valueLength = el.parentElement?.dataset.length
      charCount.textContent = valueLength ? `${valueLength} chars` : null
    }
  })

  metaList.addEventListener('mouseleave', () => {
    charCount.textContent = null
  })

  metaListColumnWidth1.addEventListener('input', () => {
    metaTable.querySelector('col[name="key"]')?.setAttribute('width', metaListColumnWidth1.value + '%')
  })
  metaListColumnWidth1.addEventListener('change', () => {
    updateColumnWidthInputs()
  })

  settingsDialogOpenButton.addEventListener('click', () => settingsDialog.showModal())
  settingsDialogCloseButton.addEventListener('click', () => settingsDialog.close())

  document.addEventListener('click', (evt) => {
    const link = (evt.target as HTMLElement).closest('a')
    if (link?.matches('a[href^="#!"]')) {
      const href = link.getAttribute('href')
      const matches = href?.match(/^#!(\w+)=(.*)$/)
      const action = matches?.[1]
      const value = matches?.[2]
      switch (action) {
        case 'inspect':
          if (value) inspectHeadElement(parseInt(value))
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
  injectDevtools(currentTabId).then(connect).then(bind(handleMessage))
})

injectDevtools(currentTabId).then(connect).then(bind(handleMessage))
