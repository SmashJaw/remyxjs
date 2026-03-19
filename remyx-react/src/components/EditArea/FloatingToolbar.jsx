import React, { useRef, useEffect, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { ToolbarButton } from '../Toolbar/ToolbarButton.jsx'
import { useSelectionContext } from '../../config/SelectionContext.js'

const FLOATING_COMMANDS = ['bold', 'italic', 'underline', 'strikethrough', 'link']

// Positioning constants
const TOOLBAR_FALLBACK_HEIGHT = 40
const TOOLBAR_FALLBACK_WIDTH = 200
const TOOLBAR_GAP = 8
const TOOLBAR_EDGE_PADDING = 4

function FloatingToolbarInner({ visible, selectionRect, engine, editorRect, onOpenModal }) {
  const selectionState = useSelectionContext()
  const ref = useRef(null)
  const sizeRef = useRef({ width: 0, height: 0 })
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [hasFocus, setHasFocus] = useState(false)

  // Cache toolbar dimensions via ResizeObserver to avoid forced reflows
  useEffect(() => {
    if (!ref.current) return
    const observer = new ResizeObserver(([entry]) => {
      sizeRef.current = {
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }
    })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || !selectionRect || !editorRect) return

    const toolbarHeight = sizeRef.current.height || ref.current?.offsetHeight || TOOLBAR_FALLBACK_HEIGHT
    const toolbarWidth = sizeRef.current.width || ref.current?.offsetWidth || TOOLBAR_FALLBACK_WIDTH

    let top = selectionRect.top - editorRect.top - toolbarHeight - TOOLBAR_GAP
    let left = selectionRect.left - editorRect.left + selectionRect.width / 2 - toolbarWidth / 2

    // Clamp to editor bounds
    if (top < 0) top = selectionRect.bottom - editorRect.top + TOOLBAR_GAP
    if (left < 0) left = TOOLBAR_EDGE_PADDING
    if (left + toolbarWidth > editorRect.width) left = editorRect.width - toolbarWidth - TOOLBAR_EDGE_PADDING

    setPosition({ top, left })
  }, [visible, selectionRect, editorRect])

  // Arrow-key navigation between toolbar buttons
  const handleKeyDown = useCallback((e) => {
    const toolbar = ref.current
    if (!toolbar) return

    const buttons = Array.from(toolbar.querySelectorAll('button:not([disabled])'))
    const currentIndex = buttons.indexOf(document.activeElement)

    let nextIndex = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      nextIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1
    } else if (e.key === 'Home') {
      e.preventDefault()
      nextIndex = 0
    } else if (e.key === 'End') {
      e.preventDefault()
      nextIndex = buttons.length - 1
    }

    if (nextIndex >= 0 && buttons[nextIndex]) {
      buttons[nextIndex].focus()
    }
  }, [])

  // Keep toolbar visible while any button inside has focus
  const handleFocusIn = useCallback(() => setHasFocus(true), [])
  const handleFocusOut = useCallback(() => setHasFocus(false), [])

  // Prevent editor from losing focus/selection on mousedown (task 222)
  const handleMouseDown = useCallback((e) => e.preventDefault(), [])

  if ((!visible && !hasFocus) || !engine) return null

  return (
    <div
      ref={ref}
      className="rmx-floating-toolbar"
      style={{ top: position.top, left: position.left }}
      role="toolbar"
      aria-label="Formatting toolbar"
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      onFocus={handleFocusIn}
      onBlur={handleFocusOut}
    >
      {FLOATING_COMMANDS.map((cmd, i) => {
        if (cmd === 'link') {
          return (
            <ToolbarButton
              key={cmd}
              command={cmd}
              tooltip="Insert Link"
              active={!!selectionState.link}
              onClick={() => onOpenModal?.('link', { text: engine.selection.getSelectedText() })}
            />
          )
        }
        const isActive = selectionState[cmd] || false
        return (
          <ToolbarButton
            key={cmd}
            command={cmd}
            tooltip={cmd.charAt(0).toUpperCase() + cmd.slice(1)}
            active={isActive}
            onClick={() => engine.executeCommand(cmd)}
          />
        )
      })}
    </div>
  )
}

export const FloatingToolbar = React.memo(FloatingToolbarInner)

FloatingToolbar.propTypes = {
  visible: PropTypes.bool.isRequired,
  selectionRect: PropTypes.object,
  engine: PropTypes.object,
  editorRect: PropTypes.object,
  onOpenModal: PropTypes.func,
}
