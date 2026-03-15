import { EventBus } from './EventBus.js'
import { Selection } from './Selection.js'
import { CommandRegistry } from './CommandRegistry.js'
import { History } from './History.js'
import { KeyboardManager } from './KeyboardManager.js'
import { Sanitizer } from './Sanitizer.js'
import { Clipboard } from './Clipboard.js'
import { DragDrop } from './DragDrop.js'
import { PluginManager } from '../plugins/PluginManager.js'

export class EditorEngine {
  constructor(element, options = {}) {
    this.element = element
    this.options = options
    this.outputFormat = options.outputFormat || 'html'
    this.isSourceMode = false
    this.isMarkdownMode = false
    this._isDestroyed = false

    this.eventBus = new EventBus()
    this.selection = new Selection(element)
    this.keyboard = new KeyboardManager(this)
    this.commands = new CommandRegistry(this)
    this.history = new History(this, options.history)
    this.sanitizer = new Sanitizer(options.sanitize)
    this.clipboard = new Clipboard(this)
    this.dragDrop = new DragDrop(this)
    this.plugins = new PluginManager(this)

    this._handleInput = this._handleInput.bind(this)
    this._handleSelectionChange = this._handleSelectionChange.bind(this)
    this._handleFocus = this._handleFocus.bind(this)
    this._handleBlur = this._handleBlur.bind(this)
    this._handleClick = this._handleClick.bind(this)
  }

  init() {
    this.element.setAttribute('contenteditable', 'true')
    this.element.setAttribute('role', 'textbox')
    this.element.setAttribute('aria-multiline', 'true')
    this.element.setAttribute('spellcheck', 'true')

    // Ensure there's at least one paragraph
    if (!this.element.innerHTML.trim()) {
      this.element.innerHTML = '<p><br></p>'
    }

    this.element.addEventListener('input', this._handleInput)
    this.element.addEventListener('focus', this._handleFocus)
    this.element.addEventListener('blur', this._handleBlur)
    this.element.addEventListener('click', this._handleClick)
    document.addEventListener('selectionchange', this._handleSelectionChange)

    this.keyboard.init()
    this.history.init()
    this.clipboard.init()
    this.dragDrop.init()
    this.plugins.initAll()
  }

  destroy() {
    if (this._isDestroyed) return
    this._isDestroyed = true

    this.element.removeEventListener('input', this._handleInput)
    this.element.removeEventListener('focus', this._handleFocus)
    this.element.removeEventListener('blur', this._handleBlur)
    this.element.removeEventListener('click', this._handleClick)
    document.removeEventListener('selectionchange', this._handleSelectionChange)

    this.keyboard.destroy()
    this.history.destroy()
    this.clipboard.destroy()
    this.dragDrop.destroy()
    this.plugins.destroyAll()
    this.eventBus.removeAllListeners()

    this.element.removeAttribute('contenteditable')
  }

  getHTML() {
    return this.sanitizer.sanitize(this.element.innerHTML)
  }

  setHTML(html) {
    const sanitized = this.sanitizer.sanitize(html)
    this.element.innerHTML = sanitized || '<p><br></p>'
  }

  getText() {
    return this.element.textContent || ''
  }

  isEmpty() {
    const text = this.getText().trim()
    return text === '' || text === '\n'
  }

  focus() {
    this.element.focus()
  }

  blur() {
    this.element.blur()
  }

  executeCommand(name, ...args) {
    return this.commands.execute(name, ...args)
  }

  on(event, handler) {
    return this.eventBus.on(event, handler)
  }

  off(event, handler) {
    this.eventBus.off(event, handler)
  }

  getWordCount() {
    const text = this.getText().trim()
    if (!text) return 0
    return text.split(/\s+/).length
  }

  getCharCount() {
    return this.getText().length
  }

  _handleInput() {
    // Ensure we always have at least one block element
    if (this.element.innerHTML === '' || this.element.innerHTML === '<br>') {
      this.element.innerHTML = '<p><br></p>'
      const range = document.createRange()
      range.setStart(this.element.firstChild, 0)
      range.collapse(true)
      this.selection.setRange(range)
    }
    this.eventBus.emit('content:change')
  }

  _handleSelectionChange() {
    if (!this.selection.isWithinEditor(document.activeElement)) return
    const range = this.selection.getRange()
    if (!range) return
    const formats = this.selection.getActiveFormats()
    this.eventBus.emit('selection:change', formats)
  }

  _handleFocus() {
    this.eventBus.emit('focus')
  }

  _handleBlur() {
    this.eventBus.emit('blur')
  }

  _handleClick(e) {
    // Handle task list checkbox clicks
    if (e.target.type === 'checkbox' && e.target.classList.contains('rmx-task-checkbox')) {
      e.target.checked = !e.target.checked
      this.eventBus.emit('content:change')
    }
  }
}
