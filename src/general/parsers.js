import has from '@f/has'
import snarkdown from 'snarkdown'

const parsers = {
  html: text => text,
  // Default to @developit's teeny-tiny markdown parser to get decent back
  // compat with upstream sideshow.
  markdown: snarkdown
}

/**
 * Check if a parser exists for the given format.
 *
 * @private
 * @param {string} format Format name.
 * @return {bool} Whether a parser exists.
 */
export function hasParser (format) {
  return has(format, parsers)
}

/**
 * Parse the text as the given format.
 *
 * @private
 * @param {string} format Format name.
 * @param {string} text Input text.
 * @return {string} HTML output of the parser.
 */
export function parse (format, text) {
  return hasParser(format) ? parsers[format](text) : text
}

/**
 * Register a new parser for a format.
 *
 * @param {string} format Format name.
 * @param {function(string): string} parser Parser function.
 */
export function registerParser (format, parser) {
  parsers[format] = parser
}
