import { TagRule } from 'types/Rules'

export const tagRules: TagRule[] = [
  {
    tag: 'meta',
    key: 'charset',
    pattern: { rx: /^utf-8$/i, message: 'Value must be an ASCII case-insensitive match for the string "utf-8"' },
    before: [
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
    tag: 'base',
    key: 'base',
    before: [{ tag: 'link' }, { tag: 'script' }],
  },
  {
    tag: 'title',
    key: 'title',
    required: true,
    min: 0, // by specs it can be empty
    max: 255,
  },
]
