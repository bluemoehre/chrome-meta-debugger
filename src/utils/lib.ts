/**
 * Returns a HTML escaped string
 */
export function htmlEncode(text: string): string {
  const fragment = document.createElement('div')
  fragment.appendChild(document.createTextNode(text))
  return fragment.innerHTML
}

/**
 * Returns the given string where all placeholders have been replaced with the given data
 */
export function replacePlaceholders(html: string, data: { [key: string]: string }, escape: boolean = true): string {
  let placeholder
  let replacement
  escape = escape !== false
  for (placeholder in data) {
    if (data.hasOwnProperty(placeholder)) {
      // escape regex special characters
      placeholder = placeholder.replace(/([.*+?\^=!:${}()|\[\]\/\\])/g, '\\$1')
      replacement = escape ? htmlEncode(data[placeholder]) : data[placeholder]
      html = html.replace(new RegExp('__' + placeholder + '__', 'g'), replacement)
    }
  }
  return html
}

/**
 * Returns a template's HTML as string identified by ID.
 * Template tags and script templates will be unwrapped, normal elements will be converted to string.
 */
export function getTemplate(id: string): string | null {
  let tpl = document.getElementById(id)
  return tpl
    ? tpl.tagName === 'TEMPLATE' || (tpl.tagName === 'SCRIPT' && tpl.getAttribute('type') === 'text/template')
      ? tpl.innerHTML
      : tpl.outerHTML
    : null
}
