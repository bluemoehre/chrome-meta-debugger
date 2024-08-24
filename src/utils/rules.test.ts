import { expect, describe, test } from 'vitest'
import { validateTags } from 'utils/rules'
import { Meta } from 'types/Meta'
import { Rule } from 'types/Rules'

describe('validateTags', () => {
  test('should report missing elements', () => {
    const rules: Rule[] = [
      {
        tag: 'title',
        key: 'title',
        required: true,
      },
    ]
    const meta: Meta = [
      {
        idx: 0,
        tag: 'meta',
        key: 'some',
        value: '',
        valueLink: null,
        attributes: {},
      },
    ]
    expect(validateTags(meta, rules)).toEqual([
      {
        severity: 'error',
        message: 'Element is missing',
        rule: rules[0],
        meta: null,
      },
    ])
  })

  test('should report missing values', () => {
    const rules: Rule[] = [
      {
        tag: 'title',
        key: 'title',
        min: 1,
      },
    ]
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
    expect(validateTags(meta, rules)).toEqual([
      {
        severity: 'error',
        message: 'Value is empty',
        rule: rules[0],
        meta: meta[0],
      },
    ])
  })

  test('should trim values correctly', () => {
    const rules: Rule[] = [
      {
        tag: 'title',
        key: 'title',
        min: 1,
      },
    ]
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
    expect(validateTags(meta, rules)).toEqual([
      {
        severity: 'error',
        message: 'Value is empty',
        rule: rules[0],
        meta: meta[0],
      },
    ])
  })

  test('should report minimum length issues', () => {
    const rules: Rule[] = [
      {
        tag: 'title',
        key: 'title',
        min: 30,
      },
    ]
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
    expect(validateTags(meta, rules)).toEqual([
      {
        severity: 'error',
        message: '10 / 30 - minimum length not reached',
        rule: rules[0],
        meta: meta[0],
      },
    ])
  })

  test('should report maximum length issues', () => {
    const rules: Rule[] = [
      {
        tag: 'title',
        key: 'title',
        max: 60,
      },
    ]
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
    expect(validateTags(meta, rules)).toEqual([
      {
        severity: 'error',
        message: '65 / 60 - maximum length exceeded',
        rule: rules[0],
        meta: meta[0],
      },
    ])
  })

  test('should report pattern issues', () => {
    const rules: Rule[] = [
      {
        tag: 'meta',
        key: 'charset',
        pattern: { rx: /^utf-8$/i, message: 'Pattern does not match' },
      },
    ]
    const meta: Meta = [
      {
        idx: 0,
        tag: 'meta',
        key: 'charset',
        value: 'ansi',
        valueLink: null,
        attributes: {},
      },
    ]
    expect(validateTags(meta, rules)).toEqual([
      {
        severity: 'error',
        message: 'Pattern does not match',
        rule: rules[0],
        meta: meta[0],
      },
    ])
  })

  test('should report order issues', () => {
    const rules: Rule[] = [
      {
        tag: 'meta',
        key: 'charset',
        pattern: { rx: /^utf-8$/i, message: 'Pattern does not match' },
        before: [{ tag: 'title', key: 'title' }],
      },
      {
        tag: 'title',
        key: 'title',
        after: [{ tag: 'meta', key: 'charset' }],
      },
      {
        tag: 'script',
        key: 'javascript',
        after: [{ tag: 'style', key: 'stylesheet' }],
      },
      {
        tag: 'style',
        key: 'stylesheet',
        before: [{ tag: 'script', key: 'javascript' }],
      },
    ]
    const meta: Meta = [
      {
        idx: 0,
        tag: 'title',
        key: 'title',
        value: 'Hello World!',
        valueLink: null,
        attributes: {},
      },
      {
        idx: 1,
        tag: 'meta',
        key: 'charset',
        value: 'utf-8',
        valueLink: null,
        attributes: {},
      },
      {
        idx: 2,
        tag: 'script',
        key: 'javascript',
        value: 'js',
        valueLink: null,
        attributes: {},
      },
      {
        idx: 3,
        tag: 'style',
        key: 'stylesheet',
        value: 'css',
        valueLink: null,
        attributes: {},
      },
    ]
    expect(validateTags(meta, rules)).toEqual([
      {
        severity: 'error',
        message: 'Element must not occur before meta:charset',
        rule: rules[1],
        meta: meta[0],
      },
      {
        severity: 'error',
        message: 'Element must not occur after title',
        rule: rules[0],
        meta: meta[1],
      },
      {
        severity: 'error',
        message: 'Element must not occur before style:stylesheet',
        rule: rules[2],
        meta: meta[2],
      },
      {
        severity: 'error',
        message: 'Element must not occur after script:javascript',
        rule: rules[3],
        meta: meta[3],
      },
    ])
  })
})
