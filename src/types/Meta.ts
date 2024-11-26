/** HTML elements which are allowed in the document's head */
export type Tag = 'title' | 'meta' | 'base' | 'link' | 'style' | 'script' | 'noscript'

/** Index position of an element */
export type TagIndex = number

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

/** Combination that represents the identity of a document's head element */
export type TagIdent = { tag: Tag; key?: undefined }

/** Combination that represents the identity of a document's metadata item */
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
