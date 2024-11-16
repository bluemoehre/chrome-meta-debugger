import { MARK_CHAR } from 'config/defaults'

/**
 * Wraps words within string in special chars
 */
export function markWords(string: string, words: Array<string> | null, delimiter = MARK_CHAR): string {
  if (words) {
    for (const word of words) {
      string = word.length ? string.replace(new RegExp('(' + word + ')', 'gi'), delimiter + '$1' + delimiter) : string
    }
  }
  return string
}

/**
 * Strips all mark chars from the given string
 */
export function stripWordMarks(string: string, delimiter = MARK_CHAR): string {
  return string.replace(new RegExp(delimiter, 'g'), '')
}

/**
 * Converts marks added by markWords() to HTML tags
 */
export function convertMarksToHtml(string: string, delimiter = MARK_CHAR): string {
  return string.replace(new RegExp(delimiter + '(.+?)' + delimiter, 'gm'), '<mark>$1</mark>')
}
