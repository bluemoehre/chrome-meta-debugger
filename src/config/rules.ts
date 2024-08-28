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
    pattern: { rx: /utf-8/i, message: 'Value must be an ASCII case-insensitive match for the string "utf-8"' },
    test: (item, meta, idx) =>
      meta[0] === item
        ? true
        : {
            severity: 'warning',
            message:
              'Charset declaration should be the very first element, as it must be within the first 1024 bytes of the document',
          },
  },
  {
    tag: 'meta',
    key: 'content-type',
    pattern: { rx: /text\/html; charset=utf-8/, message: 'Value must be "text/html; charset=utf-8"' },
    test: (item, meta, idx) =>
      meta[0] === item
        ? true
        : {
            severity: 'warning',
            message:
              'Charset declaration should be the very first element, as it must be within the first 1024 bytes of the document',
          },
  },
  {
    tag: 'title',
    key: 'title',
    required: true,
    max: 255,
  },
]
