import { isMac } from '../utils/platform.js'

export class KeyboardManager {
  constructor(engine) {
    this.engine = engine
    this._shortcuts = new Map()
    this._handleKeyDown = this._handleKeyDown.bind(this)
  }

  init() {
    this.engine.element.addEventListener('keydown', this._handleKeyDown)
  }

  destroy() {
    this.engine.element.removeEventListener('keydown', this._handleKeyDown)
  }

  register(shortcut, commandName) {
    const normalized = this._normalizeShortcut(shortcut)
    this._shortcuts.set(normalized, commandName)
  }

  unregister(shortcut) {
    const normalized = this._normalizeShortcut(shortcut)
    this._shortcuts.delete(normalized)
  }

  getShortcutForCommand(commandName) {
    for (const [shortcut, name] of this._shortcuts) {
      if (name === commandName) return shortcut
    }
    return null
  }

  getShortcutLabel(shortcut) {
    if (!shortcut) return ''
    const parts = shortcut.split('+')
    return parts.map((p) => {
      if (p === 'mod') return isMac() ? '⌘' : 'Ctrl'
      if (p === 'shift') return isMac() ? '⇧' : 'Shift'
      if (p === 'alt') return isMac() ? '⌥' : 'Alt'
      return p.toUpperCase()
    }).join(isMac() ? '' : '+')
  }

  _normalizeShortcut(shortcut) {
    return shortcut.toLowerCase().split('+').sort().join('+')
  }

  _handleKeyDown(e) {
    const parts = []
    if (isMac() ? e.metaKey : e.ctrlKey) parts.push('mod')
    if (e.shiftKey) parts.push('shift')
    if (e.altKey) parts.push('alt')

    const key = e.key.toLowerCase()
    if (!['control', 'meta', 'shift', 'alt'].includes(key)) {
      parts.push(key)
    }

    const normalized = parts.sort().join('+')
    const commandName = this._shortcuts.get(normalized)

    if (commandName) {
      e.preventDefault()
      e.stopPropagation()
      this.engine.commands.execute(commandName)
    }
  }
}
