import { Meta, MetaItem } from 'types/Meta'
import { IGNORED_DUPLICATE_KEYS } from 'config/defaults'
import { metaConfig } from 'config/meta'

/**
 * Returns a unified list of metadata
  * @param documentHead The document's head element
 */
export function getMeta(documentHead: HTMLHeadElement): Meta {
  const elements = documentHead.children
  const meta: Meta = []

  for (let idx = 0; idx < elements.length; idx++) {
    const element = elements[idx]
    const attributeMappers = metaConfig[element.tagName] ?? []
    for (const mapper of attributeMappers) {
      if (mapper.keyAttribute == null || mapper.keyAttribute in element.attributes) {
        let tagName = element.tagName.toLowerCase()
        let key: MetaItem['key']
        let value: MetaItem['value']

        // determine key
        switch (mapper.keyNameFrom) {
          case 'tagName':
            key = tagName
            break
          case 'tagValue':
            key = element.textContent ?? ''
            break
          case 'attrName':
            key = element.getAttributeNode(mapper.keyAttribute!)!.name
            break
          case 'attrValue':
            key = element.getAttributeNode(mapper.keyAttribute!)!.value
            break
        }

        // determine value
        if (mapper.valueAttribute && mapper.valueAttribute in element.attributes) {
          value = element.getAttribute(mapper.valueAttribute!)!
        } else {
          value = element.textContent ?? ''
        }

        meta.push({
          idx,
          key,
          tag: tagName,
          value,
          valueLink: 'href' in element ? (element.href as string) : null,
          attributes: filterAttributes(element.attributes, [mapper.keyAttribute!, mapper.valueAttribute!]),
        })

        break
      }
    }
  }

  return meta
}

/**
 * Returns the given object but without the excluded keys
 **/
export function filterAttributes(attributes: NamedNodeMap, exclude: string[] = []): { [key: string]: string } {
  return Object.fromEntries(
    Array.from(attributes)
      .filter(({ name }) => !exclude.includes(name))
      .map((attr) => [attr.name, attr.value])
  )
}

/**
 * Returns a list of duplicates
 */
export function findDuplicates(meta: Meta): Array<MetaItem> {
  const seen = new Map<string, MetaItem>()
  const duplicates: Array<MetaItem> = []

  for (const item of meta) {
    // skip other tags, e.g. scripts
    if (!['meta', 'base', 'title'].includes(item.tag)) continue
    // skip ignored keys
    if (IGNORED_DUPLICATE_KEYS.includes(item.key)) continue

    const id = `${item.tag}:${item.key}`
    const duplicate = seen.get(id)

    if (duplicate) {
      duplicates.push(duplicate)
      duplicates.push(item)
    } else {
      seen.set(id, item)
    }
  }

  return duplicates
}
