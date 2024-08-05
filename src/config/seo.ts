import { SeoRule } from 'utils/seo'

export const defaultSeoRules: SeoRule[] = [
  {
    tag: 'title',
    key: 'title',
    required: true,
    min: 30,
    safe: 50,
    max: 60,
  },
  {
    tag: 'meta',
    key: 'title',
    min: 30,
    safe: 50,
    max: 60,
  },
  {
    tag: 'meta',
    key: 'description',
    min: 50,
    safe: 150,
    max: 160,
  },
  {
    tag: 'meta',
    key: 'author',
    min: 1,
    safe: 30,
    max: 100,
  },
  {
    tag: 'meta',
    key: 'og:title',
    min: 30,
    safe: 50,
    max: 60,
  },
  {
    tag: 'meta',
    key: 'og:description',
    min: 50,
    safe: 150,
    max: 160,
  },
  {
    tag: 'meta',
    key: 'og:image',
    min: 1,
    max: 2000,
  },
  {
    tag: 'meta',
    key: 'og:url',
    min: 1,
    max: 2000,
  },
  {
    tag: 'meta',
    key: 'twitter:title',
    min: 30,
    safe: 50,
    max: 60,
  },
  {
    tag: 'meta',
    key: 'twitter:description',
    min: 50,
    safe: 150,
    max: 160,
  },
  {
    tag: 'meta',
    key: 'twitter:image',
    min: 1,
    max: 2000,
  },
]
