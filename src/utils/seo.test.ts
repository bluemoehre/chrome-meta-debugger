import { expect, describe, test } from 'vitest'
import { Meta } from 'types/Meta'
import { SeoRule } from 'types/Rules'
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

  test('should report issues in same order as metadata', () => {
    const rules: SeoRule[] = [
      {
        tag: 'meta',
        key: 'description',
        min: 30,
      },
      {
        tag: 'meta',
        key: 'title',
        min: 30,
      },
    ]
    const meta: Meta = [
      {
        idx: 0,
        tag: 'meta',
        key: 'title',
        value: '',
        valueLink: null,
        attributes: {},
      },
      {
        idx: 1,
        tag: 'meta',
        key: 'description',
        value: '',
        valueLink: null,
        attributes: {},
      },
    ]
    expect(validateSeo(meta, rules)).toEqual([
      {
        severity: 'error',
        message: 'Value is empty',
        rule: rules[1],
        meta: meta[0],
      },
      {
        severity: 'error',
        message: 'Value is empty',
        rule: rules[0],
        meta: meta[1],
      },
    ])
  })
})
