import { MetaRule } from 'types/Rules'

export const tagRules: MetaRule[] = [
  {
    tag: 'base',
    key: 'base',
    beforeAll: [{ tag: 'link' }, { tag: 'script' }],
  },
  {
    tag: 'meta',
    key: 'charset',
    beforeAll: [
      { tag: 'title' },
      { tag: 'meta' },
      { tag: 'base' },
      { tag: 'link' },
      { tag: 'style' },
      { tag: 'script' },
      { tag: 'noscript' },
    ],
  },
  {
    tag: 'meta',
    key: 'charset',
    pattern: { rx: /utf-8/i, message: 'Value must be an ASCII case-insensitive match for the string "utf-8"' },
  },
  {
    tag: 'title',
    key: 'title',
    required: true,
    max: 255,
  },
]
