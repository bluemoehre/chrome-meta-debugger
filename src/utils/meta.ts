import { Meta, MetaItem } from "types/Meta";
import { metaConfig } from "config/meta";

/**
 * Returns a unified list of meta information
 * @param documentHead The document's head element
 */
export function getMeta(documentHead: HTMLHeadElement): Meta {
  const elements = documentHead.children
  const meta: Meta = []

  for (let idx = 0; idx < elements.length; idx++) {
    const element = elements[idx];
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
          valueLink: element.getAttribute('href'),
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
export function filterAttributes(attributes: NamedNodeMap, exclude: string[] = []): Map<string, string> {
  const result = Object.create(null)

  Array.prototype.slice.call(attributes).forEach((attribute) => {
    if (exclude.indexOf(attribute.name) < 0) {
      result[attribute.name] = attribute.value
    }
  })

  return result
}
