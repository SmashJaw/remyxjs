// Pre-compiled regex patterns (avoid recompilation on every selection change)
const HEADING_REGEX = /^h[1-6]$/
const BLOCK_TAGS = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV', 'BLOCKQUOTE', 'PRE', 'LI', 'TD', 'TH'])

export class Selection {
  constructor(editorElement) {
    this.editor = editorElement
  }

  getSelection() {
    return window.getSelection()
  }

  getRange() {
    const sel = this.getSelection()
    if (!sel || sel.rangeCount === 0) return null
    const range = sel.getRangeAt(0)
    if (!this.isWithinEditor(range.commonAncestorContainer)) return null
    return range
  }

  setRange(range) {
    const sel = this.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
  }

  isWithinEditor(node) {
    if (!node) return false
    const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node
    return this.editor.contains(el)
  }

  isCollapsed() {
    const sel = this.getSelection()
    return sel ? sel.isCollapsed : true
  }

  getSelectedText() {
    const sel = this.getSelection()
    return sel ? sel.toString() : ''
  }

  getSelectedHTML() {
    const range = this.getRange()
    if (!range) return ''
    const fragment = range.cloneContents()
    const div = document.createElement('div')
    div.appendChild(fragment)
    return div.innerHTML
  }

  save() {
    const range = this.getRange()
    if (!range) return null

    const preRange = document.createRange()
    preRange.selectNodeContents(this.editor)
    preRange.setEnd(range.startContainer, range.startOffset)
    const startOffset = preRange.toString().length

    return {
      startOffset,
      endOffset: startOffset + range.toString().length,
      collapsed: range.collapsed,
    }
  }

  restore(bookmark) {
    if (!bookmark) return
    const textWalker = document.createTreeWalker(
      this.editor,
      NodeFilter.SHOW_TEXT,
      null
    )

    let charCount = 0
    let startNode = null
    let startNodeOffset = 0
    let endNode = null
    let endNodeOffset = 0

    while (textWalker.nextNode()) {
      const node = textWalker.currentNode
      const nodeLength = node.textContent.length
      const nextCount = charCount + nodeLength

      if (!startNode && nextCount >= bookmark.startOffset) {
        startNode = node
        startNodeOffset = bookmark.startOffset - charCount
      }
      if (!endNode && nextCount >= bookmark.endOffset) {
        endNode = node
        endNodeOffset = bookmark.endOffset - charCount
        break
      }
      charCount = nextCount
    }

    if (startNode) {
      try {
        const range = document.createRange()
        range.setStart(startNode, Math.min(startNodeOffset, startNode.textContent.length))
        if (endNode) {
          range.setEnd(endNode, Math.min(endNodeOffset, endNode.textContent.length))
        } else {
          range.collapse(true)
        }
        this.setRange(range)
      } catch {
        // DOM structure changed between save and restore — fall back to end of editor
        try {
          const fallbackRange = document.createRange()
          fallbackRange.selectNodeContents(this.editor)
          fallbackRange.collapse(false)
          this.setRange(fallbackRange)
        } catch {
          // Editor element may not be in the DOM — nothing we can do
        }
      }
    }
  }

  collapse(toEnd = false) {
    const sel = this.getSelection()
    if (sel && sel.rangeCount > 0) {
      if (toEnd) {
        sel.collapseToEnd()
      } else {
        sel.collapseToStart()
      }
    }
  }

  getParentElement() {
    const range = this.getRange()
    if (!range) return null
    const container = range.commonAncestorContainer
    return container.nodeType === Node.TEXT_NODE ? container.parentElement : container
  }

  getParentBlock() {
    let el = this.getParentElement()
    while (el && el !== this.editor) {
      if (BLOCK_TAGS.has(el.tagName)) return el
      el = el.parentElement
    }
    return null
  }

  getClosestElement(tagName) {
    let el = this.getParentElement()
    const tag = tagName.toUpperCase()
    while (el && el !== this.editor) {
      if (el.tagName === tag) return el
      el = el.parentElement
    }
    return null
  }

  insertHTML(html) {
    document.execCommand('insertHTML', false, html)
  }

  insertNode(node) {
    const range = this.getRange()
    if (!range) return
    range.deleteContents()
    range.insertNode(node)
    range.setStartAfter(node)
    range.collapse(true)
    this.setRange(range)
  }

  wrapWith(tagName, attrs = {}) {
    const range = this.getRange()
    if (!range || range.collapsed) return null
    const el = document.createElement(tagName)
    Object.entries(attrs).forEach(([key, value]) => {
      el.setAttribute(key, value)
    })
    try {
      range.surroundContents(el)
    } catch {
      const fragment = range.extractContents()
      el.appendChild(fragment)
      range.insertNode(el)
    }
    this.setRange(range)
    return el
  }

  unwrap(tagName) {
    const el = this.getClosestElement(tagName)
    if (!el) return
    const parent = el.parentNode
    while (el.firstChild) {
      parent.insertBefore(el.firstChild, el)
    }
    parent.removeChild(el)
  }

  getActiveFormats() {
    const formats = {
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      subscript: false,
      superscript: false,
      heading: null,
      alignment: 'left',
      orderedList: false,
      unorderedList: false,
      blockquote: false,
      codeBlock: false,
      link: null,
      fontFamily: null,
      fontSize: null,
      foreColor: null,
      backColor: null,
    }

    try {
      formats.bold = document.queryCommandState('bold')
      formats.italic = document.queryCommandState('italic')
      formats.underline = document.queryCommandState('underline')
      formats.strikethrough = document.queryCommandState('strikeThrough')
      formats.subscript = document.queryCommandState('subscript')
      formats.superscript = document.queryCommandState('superscript')
    } catch {
      // queryCommandState can throw in some edge cases
    }

    const block = this.getParentBlock()
    if (block) {
      const tag = block.tagName.toLowerCase()
      if (HEADING_REGEX.test(tag)) {
        formats.heading = tag
      }
      const align = block.style.textAlign || window.getComputedStyle(block).textAlign
      if (align) {
        formats.alignment = align === 'start' ? 'left' : align === 'end' ? 'right' : align
      }
    }

    let el = this.getParentElement()
    while (el && el !== this.editor) {
      const tag = el.tagName
      if (tag === 'OL') formats.orderedList = true
      if (tag === 'UL') formats.unorderedList = true
      if (tag === 'BLOCKQUOTE') formats.blockquote = true
      if (tag === 'PRE') formats.codeBlock = true
      if (tag === 'A') formats.link = { href: el.href, text: el.textContent, target: el.target }
      el = el.parentElement
    }

    try {
      formats.fontFamily = document.queryCommandValue('fontName') || null
      formats.fontSize = document.queryCommandValue('fontSize') || null
      formats.foreColor = document.queryCommandValue('foreColor') || null
      formats.backColor = document.queryCommandValue('backColor') || null
    } catch {
      // ignore
    }

    return formats
  }

  getBoundingRect() {
    const range = this.getRange()
    if (!range) return null
    return range.getBoundingClientRect()
  }
}
