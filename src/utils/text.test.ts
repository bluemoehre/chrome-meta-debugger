import { expect, describe, test } from 'vitest'
import { linkUrls, truncate } from 'utils/text'

describe('linkUrls', () => {
  test.each([
    {
      input: 'https://example.com',
      expected: '<a href="https://example.com" target="_blank">https://example.com</a>',
      description: 'a URL',
    },
    {
      input: 'Cupidatat https://example.com cillum quis.',
      expected: 'Cupidatat <a href="https://example.com" target="_blank">https://example.com</a> cillum quis.',
      description: 'a URL within a text',
    },
  ])('should link $description', ({ input, expected }) => {
    expect(linkUrls(input)).toEqual(expected)
  })
})

describe('truncate', () => {
  test.each([
    {
      input: '',
      expected: '',
      description: 'no text',
    },
    {
      input: 'Qui aliqua exercitation laboris.',
      expected: 'Qui aliqua exercitation laboris.',
      description: 'a short text',
    },
    {
      input: 'Qui aliqua exercitation laboris dolor eiusmod proident aliquip.',
      expected: 'Qui aliqua exercitation laboris dolor eiusmod proi…',
      description: 'a long text',
    },
  ])('should handle $description correctly', ({ input, expected }) => {
    expect(truncate(input, 50)).toEqual(expected)
  })
})
