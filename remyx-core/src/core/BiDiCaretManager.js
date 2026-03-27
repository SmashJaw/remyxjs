/**
 * BiDiCaretManager — Handles bidirectional (BiDi) caret movement.
 *
 * Intercepts ArrowLeft/ArrowRight keydown events and ensures the caret
 * moves in the correct **visual** direction regardless of the block's
 * text direction. In RTL blocks, ArrowLeft visually moves forward
 * (deeper into the text) and ArrowRight visually moves backward.
 *
 * Also handles BiDi boundary crossing — when the caret sits between
 * characters of different directionality, native browser behavior is
 * inconsistent, so we override it with explicit visual movement.
 */

const ARROW_KEYS = new Set(['ArrowLeft', 'ArrowRight'])

export class BiDiCaretManager {
  /**
   * @param {import('./EditorEngine.js').EditorEngine} engine
   */
  constructor(engine) {
    this.engine = engine
    this._handleKeyDown = this._handleKeyDown.bind(this)
  }

  /**
   * Attaches the keydown listener on the editor element.
   * Uses capture phase so it fires before KeyboardManager and plugins.
   */
  init() {
    this.engine.element.addEventListener('keydown', this._handleKeyDown, true)
  }

  /**
   * Removes the keydown listener.
   */
  destroy() {
    this.engine.element.removeEventListener('keydown', this._handleKeyDown, true)
  }

  /**
   * Handles ArrowLeft/ArrowRight keydown events with BiDi awareness.
   *
   * The handler activates in two situations:
   * 1. The caret is inside an RTL block — arrow direction is flipped
   * 2. The caret is at a BiDi boundary — we override to ensure visual movement
   *
   * Modifier keys: only Shift is supported (for selection extension).
   * Ctrl/Cmd/Alt combos (word-jump, etc.) are left to browser defaults.
   *
   * @param {KeyboardEvent} e
   * @private
   */
  _handleKeyDown(e) {
    if (!ARROW_KEYS.has(e.key)) return

    // Let the browser handle Ctrl/Cmd/Alt combos (word-jump, line-jump, etc.)
    if (e.ctrlKey || e.metaKey || e.altKey) return

    const selection = this.engine.selection
    const blockDir = selection.getBlockDirection()
    const atBoundary = selection.isAtBiDiBoundary()

    // In LTR blocks with no BiDi boundary, browser default is fine
    if (blockDir === 'ltr' && !atBoundary) return

    const visualDirection = e.key === 'ArrowLeft' ? 'left' : 'right'
    const extend = e.shiftKey

    e.preventDefault()
    selection.moveVisual(visualDirection, extend, 'character')
  }
}
