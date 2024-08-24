import { TagMap } from 'types/Meta'

/**
 * standard elements:
 * `<base>`, `<link>`, `<meta>`, `<noscript>`, `<script>`, `<style>`, `<title>`
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Content_categories#metadata_content
 **/
export const tagMap: TagMap = {
  TITLE: [
    {
      keyNameFrom: 'tagName',
      keyAttribute: null,
      valueAttribute: null,
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
  BASE: [
    {
      keyNameFrom: 'tagName',
      keyAttribute: null,
      valueAttribute: 'href',
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
