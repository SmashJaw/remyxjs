import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Selection } from '../core/Selection.js'
import { BiDiCaretManager } from '../core/BiDiCaretManager.js'

// jsdom doesn't implement Selection.modify() — polyfill it for testing
if (!window.getSelection().modify) {
  const proto = Object.getPrototypeOf(window.getSelection())
  proto.modify = function () {}
}

describe('BiDi Caret Movement', () => {
  let editorEl

  beforeEach(() => {
    editorEl = document.createElement('div')
    editorEl.setAttribute('contenteditable', 'true')
    document.body.appendChild(editorEl)
  })

  afterEach(() => {
    document.body.removeChild(editorEl)
  })

  describe('Selection.getBlockDirection', () => {
    it('returns "ltr" when no dir attribute is set', () => {
      editorEl.innerHTML = '<p>Hello world</p>'
      const sel = new Selection(editorEl)
      // Place caret inside the paragraph
      const range = document.createRange()
      range.setStart(editorEl.querySelector('p').firstChild, 0)
      range.collapse(true)
      window.getSelection().removeAllRanges()
      window.getSelection().addRange(range)

      expect(sel.getBlockDirection()).toBe('ltr')
    })

    it('returns "rtl" when block has dir="rtl"', () => {
      editorEl.innerHTML = '<p dir="rtl">مرحبا بالعالم</p>'
      const sel = new Selection(editorEl)
      const range = document.createRange()
      range.setStart(editorEl.querySelector('p').firstChild, 0)
      range.collapse(true)
      window.getSelection().removeAllRanges()
      window.getSelection().addRange(range)

      expect(sel.getBlockDirection()).toBe('rtl')
    })

    it('returns "ltr" when block has dir="ltr"', () => {
      editorEl.innerHTML = '<p dir="ltr">Hello</p>'
      const sel = new Selection(editorEl)
      const range = document.createRange()
      range.setStart(editorEl.querySelector('p').firstChild, 0)
      range.collapse(true)
      window.getSelection().removeAllRanges()
      window.getSelection().addRange(range)

      expect(sel.getBlockDirection()).toBe('ltr')
    })
  })

  describe('Selection.isAtBiDiBoundary', () => {
    it('returns true at LTR/RTL boundary', () => {
      editorEl.innerHTML = '<p>Helloمرحبا</p>'
      const sel = new Selection(editorEl)
      const textNode = editorEl.querySelector('p').firstChild
      const range = document.createRange()
      range.setStart(textNode, 5) // Between 'o' and 'م'
      range.collapse(true)
      window.getSelection().removeAllRanges()
      window.getSelection().addRange(range)

      expect(sel.isAtBiDiBoundary()).toBe(true)
    })

    it('returns false within same-direction text', () => {
      editorEl.innerHTML = '<p>Hello world</p>'
      const sel = new Selection(editorEl)
      const textNode = editorEl.querySelector('p').firstChild
      const range = document.createRange()
      range.setStart(textNode, 3)
      range.collapse(true)
      window.getSelection().removeAllRanges()
      window.getSelection().addRange(range)

      expect(sel.isAtBiDiBoundary()).toBe(false)
    })

    it('returns false when selection is not collapsed', () => {
      editorEl.innerHTML = '<p>Helloمرحبا</p>'
      const sel = new Selection(editorEl)
      const textNode = editorEl.querySelector('p').firstChild
      const range = document.createRange()
      range.setStart(textNode, 3)
      range.setEnd(textNode, 7) // Non-collapsed selection
      window.getSelection().removeAllRanges()
      window.getSelection().addRange(range)

      expect(sel.isAtBiDiBoundary()).toBe(false)
    })
  })

  describe('Selection.moveVisual', () => {
    it('calls Selection.modify with correct direction for LTR block', () => {
      editorEl.innerHTML = '<p dir="ltr">Hello</p>'
      const sel = new Selection(editorEl)
      const range = document.createRange()
      range.setStart(editorEl.querySelector('p').firstChild, 2)
      range.collapse(true)
      window.getSelection().removeAllRanges()
      window.getSelection().addRange(range)

      const modifySpy = vi.spyOn(window.getSelection(), 'modify')

      sel.moveVisual('left')
      expect(modifySpy).toHaveBeenCalledWith('move', 'backward', 'character')

      modifySpy.mockClear()
      sel.moveVisual('right')
      expect(modifySpy).toHaveBeenCalledWith('move', 'forward', 'character')

      modifySpy.mockRestore()
    })

    it('calls Selection.modify with reversed direction for RTL block', () => {
      editorEl.innerHTML = '<p dir="rtl">مرحبا</p>'
      const sel = new Selection(editorEl)
      const range = document.createRange()
      range.setStart(editorEl.querySelector('p').firstChild, 2)
      range.collapse(true)
      window.getSelection().removeAllRanges()
      window.getSelection().addRange(range)

      const modifySpy = vi.spyOn(window.getSelection(), 'modify')

      sel.moveVisual('left')
      // In RTL, left = forward (deeper into text)
      expect(modifySpy).toHaveBeenCalledWith('move', 'forward', 'character')

      modifySpy.mockClear()
      sel.moveVisual('right')
      // In RTL, right = backward
      expect(modifySpy).toHaveBeenCalledWith('move', 'backward', 'character')

      modifySpy.mockRestore()
    })

    it('uses "extend" alter when extend=true (Shift+Arrow)', () => {
      editorEl.innerHTML = '<p dir="rtl">مرحبا</p>'
      const sel = new Selection(editorEl)
      const range = document.createRange()
      range.setStart(editorEl.querySelector('p').firstChild, 2)
      range.collapse(true)
      window.getSelection().removeAllRanges()
      window.getSelection().addRange(range)

      const modifySpy = vi.spyOn(window.getSelection(), 'modify')

      sel.moveVisual('left', true)
      expect(modifySpy).toHaveBeenCalledWith('extend', 'forward', 'character')

      modifySpy.mockRestore()
    })

    it('supports word granularity', () => {
      editorEl.innerHTML = '<p dir="rtl">مرحبا بالعالم</p>'
      const sel = new Selection(editorEl)
      const range = document.createRange()
      range.setStart(editorEl.querySelector('p').firstChild, 2)
      range.collapse(true)
      window.getSelection().removeAllRanges()
      window.getSelection().addRange(range)

      const modifySpy = vi.spyOn(window.getSelection(), 'modify')

      sel.moveVisual('right', false, 'word')
      expect(modifySpy).toHaveBeenCalledWith('move', 'backward', 'word')

      modifySpy.mockRestore()
    })
  })

  describe('BiDiCaretManager', () => {
    it('intercepts ArrowLeft in RTL block', () => {
      editorEl.innerHTML = '<p dir="rtl">مرحبا</p>'
      const engine = {
        element: editorEl,
        selection: new Selection(editorEl),
      }
      const manager = new BiDiCaretManager(engine)
      manager.init()

      // Place caret
      const range = document.createRange()
      range.setStart(editorEl.querySelector('p').firstChild, 2)
      range.collapse(true)
      window.getSelection().removeAllRanges()
      window.getSelection().addRange(range)

      const modifySpy = vi.spyOn(window.getSelection(), 'modify')
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
        cancelable: true,
      })
      editorEl.dispatchEvent(event)

      // ArrowLeft in RTL block → forward movement
      expect(event.defaultPrevented).toBe(true)
      expect(modifySpy).toHaveBeenCalledWith('move', 'forward', 'character')

      modifySpy.mockRestore()
      manager.destroy()
    })

    it('intercepts ArrowRight in RTL block', () => {
      editorEl.innerHTML = '<p dir="rtl">مرحبا</p>'
      const engine = {
        element: editorEl,
        selection: new Selection(editorEl),
      }
      const manager = new BiDiCaretManager(engine)
      manager.init()

      const range = document.createRange()
      range.setStart(editorEl.querySelector('p').firstChild, 2)
      range.collapse(true)
      window.getSelection().removeAllRanges()
      window.getSelection().addRange(range)

      const modifySpy = vi.spyOn(window.getSelection(), 'modify')
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      })
      editorEl.dispatchEvent(event)

      // ArrowRight in RTL block → backward movement
      expect(event.defaultPrevented).toBe(true)
      expect(modifySpy).toHaveBeenCalledWith('move', 'backward', 'character')

      modifySpy.mockRestore()
      manager.destroy()
    })

    it('does not intercept in LTR block without BiDi boundary', () => {
      editorEl.innerHTML = '<p dir="ltr">Hello world</p>'
      const engine = {
        element: editorEl,
        selection: new Selection(editorEl),
      }
      const manager = new BiDiCaretManager(engine)
      manager.init()

      const range = document.createRange()
      range.setStart(editorEl.querySelector('p').firstChild, 3)
      range.collapse(true)
      window.getSelection().removeAllRanges()
      window.getSelection().addRange(range)

      const event = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
        cancelable: true,
      })
      editorEl.dispatchEvent(event)

      // Should NOT be intercepted — browser default handles it
      expect(event.defaultPrevented).toBe(false)

      manager.destroy()
    })

    it('does not intercept when Ctrl/Meta is held', () => {
      editorEl.innerHTML = '<p dir="rtl">مرحبا</p>'
      const engine = {
        element: editorEl,
        selection: new Selection(editorEl),
      }
      const manager = new BiDiCaretManager(engine)
      manager.init()

      const range = document.createRange()
      range.setStart(editorEl.querySelector('p').firstChild, 2)
      range.collapse(true)
      window.getSelection().removeAllRanges()
      window.getSelection().addRange(range)

      const event = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      })
      editorEl.dispatchEvent(event)

      // Ctrl+Arrow should pass through to browser default
      expect(event.defaultPrevented).toBe(false)

      manager.destroy()
    })

    it('supports Shift+Arrow for selection extension in RTL', () => {
      editorEl.innerHTML = '<p dir="rtl">مرحبا</p>'
      const engine = {
        element: editorEl,
        selection: new Selection(editorEl),
      }
      const manager = new BiDiCaretManager(engine)
      manager.init()

      const range = document.createRange()
      range.setStart(editorEl.querySelector('p').firstChild, 2)
      range.collapse(true)
      window.getSelection().removeAllRanges()
      window.getSelection().addRange(range)

      const modifySpy = vi.spyOn(window.getSelection(), 'modify')
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      })
      editorEl.dispatchEvent(event)

      expect(event.defaultPrevented).toBe(true)
      expect(modifySpy).toHaveBeenCalledWith('extend', 'forward', 'character')

      modifySpy.mockRestore()
      manager.destroy()
    })

    it('intercepts at BiDi boundary in LTR block', () => {
      editorEl.innerHTML = '<p dir="ltr">Helloمرحبا</p>'
      const engine = {
        element: editorEl,
        selection: new Selection(editorEl),
      }
      const manager = new BiDiCaretManager(engine)
      manager.init()

      // Place caret at the BiDi boundary (offset 5)
      const range = document.createRange()
      range.setStart(editorEl.querySelector('p').firstChild, 5)
      range.collapse(true)
      window.getSelection().removeAllRanges()
      window.getSelection().addRange(range)

      const modifySpy = vi.spyOn(window.getSelection(), 'modify')
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      })
      editorEl.dispatchEvent(event)

      // At a BiDi boundary in LTR block, we should intercept
      expect(event.defaultPrevented).toBe(true)
      // LTR block: right = forward
      expect(modifySpy).toHaveBeenCalledWith('move', 'forward', 'character')

      modifySpy.mockRestore()
      manager.destroy()
    })

    it('cleans up listener on destroy', () => {
      const engine = {
        element: editorEl,
        selection: new Selection(editorEl),
      }
      const manager = new BiDiCaretManager(engine)
      manager.init()

      const spy = vi.spyOn(editorEl, 'removeEventListener')
      manager.destroy()
      expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function), true)
      spy.mockRestore()
    })
  })
})
