import { MARK_CHAR } from 'config/defaults'

/**
 * Wraps words within string in special chars
 */
export function markWords(string: string, words: Array<string> | null): string {
  if (words) {
    for (const word of words) {
      string = word.length ? string.replace(new RegExp('(' + word + ')', 'gi'), MARK_CHAR + '$1' + MARK_CHAR) : string
    }
  }
  return string
}

/**
 * Strips all mark chars from the given string
 */
export function stripWordMarks(string: string): string {
  return string.replace(new RegExp(MARK_CHAR, 'g'), '')
}

/**
 * Converts marks added by markWords() to HTML tags
 */
export function convertMarksToHtml(string: string): string {
  return string.replace(new RegExp(MARK_CHAR + '(.+?)' + MARK_CHAR, 'gm'), '<mark>$1</mark>')
}
