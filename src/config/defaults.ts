/** Name of the messaging port for identification */
export const PORT_NAME = 'devtools.panel.meta'

/** Message action key for errors */
export const MSG_ACTION_ERROR = 'error'

/** Message action key to request updates */
export const MSG_ACTION_UPDATE = 'update'

/** Special char for marking string parts (U+FEFF - zero width no-break space) */
export const MARK_CHAR = '\uFEFF'

/** Meta key duplicates to ignore */
export const IGNORED_DUPLICATE_KEYS = ['msapplication-task', 'msapplication-task-separator']

/** Max meta value length to display if not matched by a filter */
export const MAX_UNMATCHED_VALUE_LENGTH = 900

/** Selector for finding supported head elements */
export const HEAD_ELEMENT_SELECTOR = 'head title, head base, head meta, head link'
