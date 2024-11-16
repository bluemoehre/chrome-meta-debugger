import { expect, describe, test } from 'vitest'
import { MARK_CHAR } from 'config/defaults'
import { convertMarksToHtml, markWords, stripWordMarks } from 'utils/marker'

describe('markWords', () => {
  test('should wrap matching words with special char correctly', () => {
    expect(
      markWords('Consectetur aliqua eu occaecat quis eiusmod fugiat sit ipsum ullamco ea minim.', [
        'lorem',
        'ipsum',
        'eu',
      ])
    ).toEqual(
      `Consectetur aliqua ${MARK_CHAR}eu${MARK_CHAR} occaecat quis eiusmod fugiat sit ${MARK_CHAR}ipsum${MARK_CHAR} ullamco ea minim.`
    )
  })
})

describe('stripWordMarks', () => {
  test('should strip all special word marker chars', () => {
    expect(
      stripWordMarks(
        `Consectetur aliqua ${MARK_CHAR}eu${MARK_CHAR} occaecat quis eiusmod fugiat sit ${MARK_CHAR}ipsum${MARK_CHAR} ullamco ea minim.`
      )
    ).toEqual('Consectetur aliqua eu occaecat quis eiusmod fugiat sit ipsum ullamco ea minim.')
  })
})

describe('convertMarksToHtml', () => {
  test('should convert all marks to valid HTML', () => {
    expect(
      convertMarksToHtml(
        `Consectetur aliqua ${MARK_CHAR}eu${MARK_CHAR} occaecat quis eiusmod fugiat sit ${MARK_CHAR}ipsum${MARK_CHAR} ullamco ea minim.`
      )
    ).toEqual(
      'Consectetur aliqua <mark>eu</mark> occaecat quis eiusmod fugiat sit <mark>ipsum</mark> ullamco ea minim.'
    )
  })
})
