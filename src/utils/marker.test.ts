import { expect, describe, test } from 'vitest'
import { convertMarksToHtml, markWords, stripWordMarks } from 'utils/marker'

const MARKER = '\uFEFF'

describe('markWords', () => {
  test('should wrap matching words with special char correctly', () => {
    expect(
      markWords(
        'Consectetur aliqua eu occaecat quis eiusmod fugiat sit ipsum ullamco ea minim.',
        ['lorem', 'ipsum', 'eu'],
        MARKER
      )
    ).toEqual(
      `Consectetur aliqua ${MARKER}eu${MARKER} occaecat quis eiusmod fugiat sit ${MARKER}ipsum${MARKER} ullamco ea minim.`
    )
  })
})

describe('stripWordMarks', () => {
  test('should strip all special word marker chars', () => {
    expect(
      stripWordMarks(
        `Consectetur aliqua ${MARKER}eu${MARKER} occaecat quis eiusmod fugiat sit ${MARKER}ipsum${MARKER} ullamco ea minim.`,
        MARKER
      )
    ).toEqual('Consectetur aliqua eu occaecat quis eiusmod fugiat sit ipsum ullamco ea minim.')
  })
})

describe('convertMarksToHtml', () => {
  test('should convert all marks to valid HTML', () => {
    expect(
      convertMarksToHtml(
        `Consectetur aliqua ${MARKER}eu${MARKER} occaecat quis eiusmod fugiat sit ${MARKER}ipsum${MARKER} ullamco ea minim.`,
        MARKER
      )
    ).toEqual(
      'Consectetur aliqua <mark>eu</mark> occaecat quis eiusmod fugiat sit <mark>ipsum</mark> ullamco ea minim.'
    )
  })
})
