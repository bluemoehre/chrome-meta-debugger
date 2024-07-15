import { ElementConfig } from "types/Meta"

export const metaConfig: ElementConfig = {
  TITLE: [
    {
      keyNameFrom: 'tagName',
      keyAttribute: null,
      valueAttribute: null,
    },
  ],
  BASE: [
    {
      keyNameFrom: 'tagName',
      keyAttribute: null,
      valueAttribute: 'href',
    },
  ],
  META: [
    {
      keyNameFrom: 'attrName',
      keyAttribute: 'charset',
      valueAttribute: 'charset',
    },
    {
      keyNameFrom: 'attrValue',
      keyAttribute: 'name',
      valueAttribute: 'content',
    },
    {
      keyNameFrom: 'attrValue',
      keyAttribute: 'property',
      valueAttribute: 'content',
    },
    {
      keyNameFrom: 'attrValue',
      keyAttribute: 'http-equiv',
      valueAttribute: 'content',
    },
  ],
  LINK: [
    {
      keyNameFrom: 'attrValue',
      keyAttribute: 'rel',
      valueAttribute: 'href',
    },
  ],
}
