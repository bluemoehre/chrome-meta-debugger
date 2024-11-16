import { expect, describe, test } from 'vitest'
import { getTemplate, escapeHtml, render } from 'utils/templating'

describe('getTemplate', () => {
  test('should return `null` if template ID does not exist', () => {
    expect(getTemplate('tpl')).toEqual(null)
  })

  test('should read inner HTML of template elements', () => {
    document.body.innerHTML = '<template id="tpl"><p>test</p></template>'
    expect(getTemplate('tpl')).toEqual('<p>test</p>')
  })

  test('should read inner HTML of script templates', () => {
    document.body.innerHTML = '<script type="text/template" id="tpl"><p>test</p></script>'
    expect(getTemplate('tpl')).toEqual('<p>test</p>')
  })

  test('should read outer HTML of other elements used as template', () => {
    document.body.innerHTML = '<p id="tpl">test</p>'
    expect(getTemplate('tpl')).toEqual('<p id="tpl">test</p>')
  })
})

describe('escapeHtml', () => {
  test('should escape HTML correctly', () => {
    expect(escapeHtml('<p class="do">escape me & you</p>')).toEqual('&lt;p class="do"&gt;escape me &amp; you&lt;/p&gt;')
  })
})

describe('render', () => {
  test('should render template correctly', () => {
    const template = '<div class="test test-__variant__">__content__</div>'
    expect(render(template, { variant: 'a', content: 'text' })).toEqual('<div class="test test-a">text</div>')
  })
})
