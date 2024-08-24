/** HTML elements which are allowed in the document's head */
export type Tag = 'title' | 'meta' | 'base' | 'link' | 'style' | 'script' | 'noscript'

/** Map of head elements and their corresponding attribute handling */
export type TagMap = { [tagName: string]: TagAttributeConfig[] }

/** Definition of how to handle a head element's attributes */
export type TagAttributeConfig = {
  /** The item's primary key attribute */
  keyAttribute: string | null
  /** How to determine the item's name */
  keyNameFrom: 'tagName' | 'tagValue' | 'attrName' | 'attrValue'
  /** The attribute having the items's primary value */
  valueAttribute: string | null
}

/** Combination that represents the unique identity of the document's metadata */
export type MetaIdent = { tag: Tag; key: string }

/** Meta list item to display in the DevTools panel */
export type MetaItem = MetaIdent & {
  idx: number
  value: string
  valueLink: string | null
  attributes: { [key: string]: string }
}

/** List of metadata to display in the DevTools panel. **/
export type Meta = MetaItem[]
