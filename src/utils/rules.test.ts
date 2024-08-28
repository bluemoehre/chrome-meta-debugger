import { expect, describe, test } from 'vitest'
import { validateMeta } from 'utils/rules'
import { Meta } from 'types/Meta'
import { MetaRule } from 'types/Rules'

describe('validateMeta', () => {
  test('should trim values correctly', () => {
    const rules: MetaRule[] = [
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
    expect(validateMeta(meta, rules)).toEqual([
      {
        severity: 'error',
        message: 'Value is empty',
        rule: rules[0],
        meta: meta[0],
      },
    ])
  })

  test('should call test function correctly', () => {
    const rules: MetaRule[] = [
      {
        tag: 'meta',
        key: 'foobar',
        test: (item, meta, index) => {
          if (item !== meta[index]) {
            return { severity: 'error', message: 'arguments are not passed correctly' }
          } else {
            return true
          }
        },
      },
    ]
    const meta: Meta = [
      {
        idx: 0,
        tag: 'meta',
        key: 'foobar',
        value: 'FooBar',
        valueLink: null,
        attributes: {},
      },
    ]
    expect(validateMeta(meta, rules)).toEqual([])
  })

  test('should report missing elements', () => {
    const rules: MetaRule[] = [
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
      {
        idx: 1,
        tag: 'meta',
        key: 'data',
        value: '',
        valueLink: null,
        attributes: {},
      },
    ]
    expect(validateMeta(meta, rules)).toEqual([
      {
        severity: 'error',
        message: 'Element is missing',
        rule: rules[0],
        meta: null,
      },
    ])
  })

  test('should report missing values', () => {
    const rules: MetaRule[] = [
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
    expect(validateMeta(meta, rules)).toEqual([
      {
        severity: 'error',
        message: 'Value is empty',
        rule: rules[0],
        meta: meta[0],
      },
    ])
  })

  test('should report minimum length issues', () => {
    const rules: MetaRule[] = [
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
    expect(validateMeta(meta, rules)).toEqual([
      {
        severity: 'error',
        message: '10 / 30 - minimum length not reached',
        rule: rules[0],
        meta: meta[0],
      },
    ])
  })

  test('should report maximum length issues', () => {
    const rules: MetaRule[] = [
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
    expect(validateMeta(meta, rules)).toEqual([
      {
        severity: 'error',
        message: '65 / 60 - maximum length exceeded',
        rule: rules[0],
        meta: meta[0],
      },
    ])
  })

  test('should report pattern issues', () => {
    const rules: MetaRule[] = [
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
    expect(validateMeta(meta, rules)).toEqual([
      {
        severity: 'error',
        message: 'Pattern does not match',
        rule: rules[0],
        meta: meta[0],
      },
    ])
  })

  test('should report general order issues', () => {
    const rules: MetaRule[] = [
      {
        tag: 'meta',
        key: 'charset',
        beforeAll: [{ tag: 'title' }],
      },
      {
        tag: 'title',
        key: 'title',
        afterAll: [{ tag: 'meta' }],
      },
      {
        tag: 'script',
        key: 'javascript',
        afterAll: [{ tag: 'style' }],
      },
      {
        tag: 'style',
        key: 'stylesheet',
        beforeAll: [{ tag: 'script' }],
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
    expect(validateMeta(meta, rules)).toEqual([
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

  test('should report block order issues', () => {
    const rules: MetaRule[] = [
      {
        tag: 'meta',
        key: 'block:content',
        followsAny: [
          { tag: 'meta', key: 'block:start' },
          { tag: 'meta', key: 'block:content' },
        ],
        precedesAny: [
          { tag: 'meta', key: 'block:content' },
          { tag: 'meta', key: 'block:end' },
        ],
      },
      {
        tag: 'meta',
        key: 'block:start',
        precedesAny: [
          { tag: 'meta', key: 'block:content' },
          { tag: 'meta', key: 'block:end' },
        ],
      },
      {
        tag: 'meta',
        key: 'block:end',
        followsAny: [
          { tag: 'meta', key: 'block:start' },
          { tag: 'meta', key: 'block:content' },
        ],
      },
    ]
    const meta: Meta = [
      {
        idx: 0,
        tag: 'meta',
        key: 'block:content',
        value: 'Lorem Ipsum',
        valueLink: null,
        attributes: {},
      },
      {
        idx: 1,
        tag: 'meta',
        key: 'block:end',
        value: 'Lorem Ipsum',
        valueLink: null,
        attributes: {},
      },
      {
        idx: 2,
        tag: 'meta',
        key: 'block:start',
        value: 'Lorem Ipsum',
        valueLink: null,
        attributes: {},
      },
      {
        idx: 3,
        tag: 'meta',
        key: 'block:content',
        value: 'Lorem Ipsum',
        valueLink: null,
        attributes: {},
      },
    ]
    expect(validateMeta(meta, rules)).toEqual([
      {
        severity: 'error',
        message: 'Element must follow one of meta:block:start, meta:block:content',
        rule: rules[0],
        meta: meta[0],
      },
      {
        severity: 'error',
        message: 'Element must precede one of meta:block:content, meta:block:end',
        rule: rules[0],
        meta: meta[3],
      },
    ])
  })

  test('should report test function issues', () => {
    const rules: MetaRule[] = [
      {
        tag: 'meta',
        key: 'Bar',
        test: () => ({ severity: 'error', message: 'Oops' }),
      },
    ]
    const meta: Meta = [
      {
        idx: 0,
        tag: 'meta',
        key: 'Bar',
        value: 'FooBar',
        valueLink: null,
        attributes: {},
      },
    ]
    expect(validateMeta(meta, rules)).toEqual([
      {
        severity: 'error',
        message: 'Oops',
        rule: rules[0],
        meta: meta[0],
      },
    ])
  })

  test('should report issues in same order as metadata', () => {
    const rules: MetaRule[] = [
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
    expect(validateMeta(meta, rules)).toEqual([
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
