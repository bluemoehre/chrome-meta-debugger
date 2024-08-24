import { expect, describe, test } from 'vitest'
import { Meta } from 'types/Meta'
import { SeoRule } from 'types/Seo'
import { validateSeo } from 'utils/seo'

describe('validateSeo', () => {
  const rules: SeoRule[] = [
    {
      tag: 'title',
      key: 'title',
      required: true,
      min: 30,
      safe: 50,
      max: 60,
    },
  ]

  test('should not report optional elements', () => {
    const rules: SeoRule[] = [
      {
        tag: 'meta',
        key: 'title',
      },
    ]
    const meta: Meta = []
    expect(validateSeo(meta, rules)).toEqual([])
  })

  test('should report missing elements', () => {
    const meta: Meta = [
      {
        idx: 0,
        tag: 'meta',
        key: 'test',
        value: '',
        valueLink: null,
        attributes: {},
      },
    ]
    expect(validateSeo(meta, rules)).toEqual([
      {
        severity: 'error',
        message: 'Element is missing',
        rule: rules[0],
        meta: null,
      },
    ])
  })

  test('should report missing values', () => {
    const meta: Meta = [
      {
        idx: 0,
        tag: 'title',
        key: 'title',
        value: '',
        valueLink: null,
        attributes: {},
      },
    ]
    expect(validateSeo(meta, rules)).toEqual([
      {
        severity: 'error',
        message: 'Value is empty',
        rule: rules[0],
        meta: meta[0],
      },
    ])
  })

  test('should trim values correctly', () => {
    const meta: Meta = [
      {
        idx: 0,
        tag: 'title',
        key: 'title',
        value: '     ',
        valueLink: null,
        attributes: {},
      },
    ]
    expect(validateSeo(meta, rules)).toEqual([
      {
        severity: 'error',
        message: 'Value is empty',
        rule: rules[0],
        meta: meta[0],
      },
    ])
  })

  test('should report minimum length issues', () => {
    const meta: Meta = [
      {
        idx: 0,
        tag: 'title',
        key: 'title',
        value: 'Cool stuff',
        valueLink: null,
        attributes: {},
      },
    ]
    expect(validateSeo(meta, rules)).toEqual([
      {
        severity: 'warning',
        message: '10 / 30 - recommended length not reached',
        rule: rules[0],
        meta: meta[0],
      },
    ])
  })

  test('should report critical length issues', () => {
    const meta: Meta = [
      {
        idx: 0,
        tag: 'title',
        key: 'title',
        value: 'Duis aliqua nulla enim sit fugiat tempor aliqua quis non.',
        valueLink: null,
        attributes: {},
      },
    ]
    expect(validateSeo(meta, rules)).toEqual([
      {
        severity: 'warning',
        message: '57 / 50 - recommended length exceeded',
        rule: rules[0],
        meta: meta[0],
      },
    ])
  })

  test('should report maximum length issues', () => {
    const meta: Meta = [
      {
        idx: 0,
        tag: 'title',
        key: 'title',
        value: 'Duis aliqua nulla enim sit fugiat tempor aliqua quis non laboris.',
        valueLink: null,
        attributes: {},
      },
    ]
    expect(validateSeo(meta, rules)).toEqual([
      {
        severity: 'error',
        message: '65 / 60 - maximum length exceeded',
        rule: rules[0],
        meta: meta[0],
      },
    ])
  })
})
