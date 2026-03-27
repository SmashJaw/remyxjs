/**
 * RTL (right-to-left) language support utilities.
 *
 * Provides automatic text direction detection and helpers for
 * bidirectional content within the editor.
 */

// Unicode ranges for RTL scripts
const RTL_REGEX = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/
const RTL_REGEX_GLOBAL = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/g

// Unicode ranges for LTR scripts (Latin, CJK, etc.)
const LTR_REGEX = /[A-Za-z\u00C0-\u00FF\u0100-\u024F\u0400-\u04FF\u1100-\u11FF\u3040-\u309F\u30A0-\u30FF\u3400-\u4DBF\u4E00-\u9FFF]/
const LTR_REGEX_GLOBAL = /[A-Za-z\u00C0-\u00FF\u0100-\u024F\u0400-\u04FF\u1100-\u11FF\u3040-\u309F\u30A0-\u30FF\u3400-\u4DBF\u4E00-\u9FFF]/g

/**
 * Detect the dominant text direction of a string.
 *
 * Counts RTL vs LTR character occurrences and returns the direction
 * of whichever has more characters. Returns 'auto' if the string
 * contains no directional characters (e.g., numbers only).
 *
 * @param {string} text - The text to analyze
 * @returns {'ltr' | 'rtl' | 'auto'} The detected text direction
 */
export function detectTextDirection(text) {
  if (!text || typeof text !== 'string') return 'auto'

  const rtlMatches = text.match(RTL_REGEX_GLOBAL)
  const ltrMatches = text.match(LTR_REGEX_GLOBAL)
  const rtlCount = rtlMatches ? rtlMatches.length : 0
  const ltrCount = ltrMatches ? ltrMatches.length : 0

  if (rtlCount === 0 && ltrCount === 0) return 'auto'
  return rtlCount > ltrCount ? 'rtl' : 'ltr'
}

/**
 * Apply the `dir` attribute to a block element based on its text content.
 *
 * This function is designed to be called on each block-level element
 * (paragraph, heading, list item, etc.) to set the appropriate
 * text direction.
 *
 * @param {HTMLElement} element - The block element to update
 */
export function applyAutoDirection(element) {
  if (!element || !element.textContent) return
  const dir = detectTextDirection(element.textContent)
  if (dir === 'auto') {
    element.removeAttribute('dir')
  } else {
    element.setAttribute('dir', dir)
  }
}

/**
 * Apply auto-direction to all block-level elements in a container.
 *
 * @param {HTMLElement} container - The container element (typically the editor root)
 */
export function applyAutoDirectionAll(container) {
  if (!container) return
  const blocks = container.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th')
  for (const block of blocks) {
    applyAutoDirection(block)
  }
}

/**
 * Detect the direction of a single character.
 *
 * @param {string} char - A single character to test
 * @returns {'ltr' | 'rtl' | 'neutral'} The character's directionality
 */
export function getCharDirection(char) {
  if (!char || typeof char !== 'string') return 'neutral'
  // Take only the first character (supports surrogate pairs via slice)
  const c = char.length > 1 ? char.slice(0, 1) : char
  if (RTL_REGEX.test(c)) return 'rtl'
  if (LTR_REGEX.test(c)) return 'ltr'
  return 'neutral'
}

/**
 * Detect whether a position in a string is at a BiDi boundary —
 * i.e. the characters immediately before and after the offset have
 * different strong directionality (ignoring neutral characters).
 *
 * @param {string} text - The text to analyze
 * @param {number} offset - The character offset (boundary is between offset-1 and offset)
 * @returns {boolean} True if this is a BiDi boundary
 */
export function isBiDiBoundary(text, offset) {
  if (!text || offset <= 0 || offset >= text.length) return false

  // Walk backward from offset-1 to find the nearest strong-direction character
  let leftDir = null
  for (let i = offset - 1; i >= 0; i--) {
    const dir = getCharDirection(text[i])
    if (dir !== 'neutral') {
      leftDir = dir
      break
    }
  }

  // Walk forward from offset to find the nearest strong-direction character
  let rightDir = null
  for (let i = offset; i < text.length; i++) {
    const dir = getCharDirection(text[i])
    if (dir !== 'neutral') {
      rightDir = dir
      break
    }
  }

  if (!leftDir || !rightDir) return false
  return leftDir !== rightDir
}

/**
 * RTL-aware CSS logical property mappings.
 * Use these constants to reference CSS logical properties in JavaScript
 * for consistent layout in both LTR and RTL contexts.
 */
export const LOGICAL_PROPERTIES = {
  marginStart: 'margin-inline-start',
  marginEnd: 'margin-inline-end',
  paddingStart: 'padding-inline-start',
  paddingEnd: 'padding-inline-end',
  borderStart: 'border-inline-start',
  borderEnd: 'border-inline-end',
  insetStart: 'inset-inline-start',
  insetEnd: 'inset-inline-end',
}
