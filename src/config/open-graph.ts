import { TagRule } from "types/Rules";

const urlPattern = { rx: /^https?:\/\//, message: 'Value must be a fully qualified URL starting with a protocol' }

export const ogRules: TagRule[] = [
  /** Canonical */
  {
    tag: 'meta',
    key: 'og:url',
    pattern: urlPattern,
  },
  
  /** Image */
  {
    tag: 'meta',
    key: 'og:image',
    pattern: urlPattern,
  },
  {
    tag: 'meta',
    key: 'og:image:url',
    pattern: urlPattern,
  },
  {
    tag: 'meta',
    key: 'og:image:secure_url',
    pattern: urlPattern,
  },
  
  /** Audio */
  {
    tag: 'meta',
    key: 'og:audio',
    pattern: urlPattern,
  },
  {
    tag: 'meta',
    key: 'og:audio:url',
    pattern: urlPattern,
  },
  {
    tag: 'meta',
    key: 'og:audio:secure_url',
    pattern: urlPattern,
  },

  /** Video */
  {
    tag: 'meta',
    key: 'og:video',
    pattern: urlPattern,
  },
  {
    tag: 'meta',
    key: 'og:video:url',
    pattern: urlPattern,
  },
  {
    tag: 'meta',
    key: 'og:video:secure_url',
    pattern: urlPattern,
  },
]
