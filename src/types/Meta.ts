/**
 * Meta list to display in the DevTools panel .
 * Each item contains:
 * - tag: tag name
 * - key: the identification key for the devtools panel
 * - value: the main value
 * - valueLink: the main value linked (if available)
 * - attributes: all other attributes which have not been in use by the properties above
 **/
export type Meta = MetaItem[]

/** Meta list item to display in the DevTools panel */
export type MetaItem = {
  idx: number
  tag: string
  key: string
  value: string
  valueLink: string | null
  attributes: Map<string, string>
}

/** Map of head elements and their corresponding attribute handling */
export type ElementConfig = { [tagName: string]: AttributeConfig[] }

/** Definition of how to handle a head element's attributes */
export type AttributeConfig = {
  /** The item's primary key attribute */
  keyAttribute: string | null
  /** How to determine the item's name */
  keyNameFrom: 'tagName' | 'tagValue' | 'attrName' | 'attrValue'
  /** The attribute having the items's primary value */
  valueAttribute: string | null
}
