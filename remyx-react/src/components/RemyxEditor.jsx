import React, { useRef, useState, useCallback, useEffect, useMemo, Suspense } from 'react'
import { createPortal } from 'react-dom'
import { useEditorEngine } from '../hooks/useEditorEngine.js'
import { useSelection } from '../hooks/useSelection.js'
import { useModal } from '../hooks/useModal.js'
import { useContextMenu } from '../hooks/useContextMenu.js'

import { useResolvedConfig } from '../hooks/useResolvedConfig.js'
import { useAutosave } from '../hooks/useAutosave.js'
import { usePortalAttachment } from '../hooks/usePortalAttachment.js'
import { useEditorRect } from '../hooks/useEditorRect.js'
import { useDragDrop } from '../hooks/useDragDrop.js'
import { useSwipeGesture } from '../hooks/useSwipeGesture.js'
import { useLongPress } from '../hooks/useLongPress.js'
import { usePinchZoom } from '../hooks/usePinchZoom.js'
import { useVirtualKeyboard } from '../hooks/useVirtualKeyboard.js'
import { loadGoogleFonts, DEFAULT_FONTS } from '@remyxjs/core'
import { SelectionContext } from '../config/SelectionContext.js'
import { Toolbar } from './Toolbar/Toolbar.jsx'
import { EditArea } from './EditArea/EditArea.jsx'
import { FloatingToolbar } from './EditArea/FloatingToolbar.jsx'
import { ImageResizeHandles } from './EditArea/ImageResizeHandles.jsx'
import { TableControls } from './EditArea/TableControls.jsx'
import { CodeBlockControls } from './EditArea/CodeBlockControls.jsx'
import { DropZoneOverlay } from './EditArea/DropZoneOverlay.jsx'
import { BlockDragHandle } from './EditArea/BlockDragHandle.jsx'
import { StatusBar, WordCountButton } from './StatusBar/StatusBar.jsx'
import { RecoveryBanner } from './RecoveryBanner/RecoveryBanner.jsx'
import { EditorErrorBoundary } from './ErrorBoundary.jsx'
import { EmptyState } from './EmptyState/EmptyState.jsx'
import { BreadcrumbBar } from './BreadcrumbBar/BreadcrumbBar.jsx'
import { Minimap } from './Minimap/Minimap.jsx'
import { SplitPreview } from './SplitPreview/SplitPreview.jsx'
import { useToast } from './Toast/Toast.jsx'

// Lazy-loaded components — only loaded when needed
const MenuBar = React.lazy(() => import('./MenuBar/MenuBar.jsx').then(m => ({ default: m.MenuBar })))
const ContextMenu = React.lazy(() => import('./ContextMenu/ContextMenu.jsx').then(m => ({ default: m.ContextMenu })))

// Item 22: Modals extracted to EditorModals sub-component
import { EditorModals, FindReplacePanel } from './EditorModals.jsx'

export default function RemyxEditor(props) {
  // Resolve configuration from props, context, and defaults
  const {
    attachTo, value, defaultValue, onChange, toolbar,
    theme, placeholder, height, minHeight, maxHeight,
    readOnly, plugins, onReady, onFocus, onBlur,
    className, style, uploadHandler, outputFormat,
    showFloatingToolbar, showContextMenu, fonts, googleFonts,
    statusBar, customTheme, toolbarItemTheme, sanitize, shortcuts,
    baseHeadingLevel, menuBarConfig, effectiveToolbar, onError, errorFallback,
    showCommandPalette,
    autosaveConfig,
    emptyState: emptyStateProp,
    showBreadcrumb,
    showMinimap,
    splitViewFormat,
    customizableToolbar: customizableToolbarProp,
    onToolbarChange,
  } = useResolvedConfig(props)

  const editAreaRef = useRef(null)
  const editorRootRef = useRef(null)

  // Load Google Fonts and merge into font list
  useEffect(() => {
    if (googleFonts && googleFonts.length > 0) {
      loadGoogleFonts(googleFonts)
    }
  }, [googleFonts])

  const mergedFonts = useMemo(() => {
    if (!googleFonts || googleFonts.length === 0) return fonts
    const googleFontNames = googleFonts.map(f => f.split(':')[0])
    const base = fonts || DEFAULT_FONTS
    const existing = new Set(base.map(f => f.toLowerCase()))
    const newFonts = googleFontNames.filter(f => !existing.has(f.toLowerCase()))
    return [...base, ...newFonts]
  }, [fonts, googleFonts])

  // Portal attachment for textarea/div binding
  const { portalContainer, effectiveValue, effectiveOnChange } = usePortalAttachment({
    attachTo, value, defaultValue, onChange,
  })

  const { engine, ready } = useEditorEngine(editAreaRef, {
    value: attachTo ? effectiveValue : value,
    defaultValue: attachTo ? undefined : defaultValue,
    onChange: effectiveOnChange,
    outputFormat,
    placeholder,
    readOnly,
    plugins,
    onReady,
    onFocus,
    onBlur,
    uploadHandler,
    sanitize,
    shortcuts,
    baseHeadingLevel,
  }, portalContainer)

  const { formatState, uiState } = useSelection(engine)
  const { modals, openModal, closeModal } = useModal()
  const { contextMenu, hideContextMenu } = useContextMenu(engine, editAreaRef)
  const { saveStatus, recoveryData, recoverContent, dismissRecovery } = useAutosave(engine, autosaveConfig)

  // #39: Toast notification system
  const [toastEl, showToast] = useToast()

  // Wire toast to engine events for transient feedback
  useEffect(() => {
    if (!engine) return
    const unsubs = [
      engine.eventBus.on('export:success', () => showToast('Export successful', 'success')),
      engine.eventBus.on('clipboard:copy', () => showToast('Copied to clipboard', 'info')),
    ]
    return () => unsubs.forEach(unsub => typeof unsub === 'function' && unsub())
  }, [engine, showToast])

  // Track editor rect for positioning overlays (ResizeObserver + rAF throttled)
  const editorRect = useEditorRect(editorRootRef)

  // Expose engine on the DOM element for E2E testing and external integrations
  useEffect(() => {
    if (editorRootRef.current && engine) {
      editorRootRef.current.__engine = engine
    }
  }, [engine])

  // Track drag-and-drop state for overlay rendering
  const { isExternalDrag, dragFileTypes } = useDragDrop(engine)

  // Mobile & touch optimization hooks
  useSwipeGesture(engine, editAreaRef, {
    onDismissToolbar: () => {
      // Trigger floating toolbar dismiss by clearing selection
      if (engine?.element) {
        window.getSelection()?.removeAllRanges()
      }
    },
  })

  // Long-press context menu on touch devices
  const handleLongPress = useCallback(({ x, y }) => {
    if (!engine) return
    // Simulate a context menu event at the touch position
    const fakeEvent = { clientX: x, clientY: y, preventDefault: () => {} }
    engine.eventBus.emit('contextmenu', fakeEvent)
  }, [engine])
  useLongPress(editAreaRef, handleLongPress, { enabled: showContextMenu && !readOnly })

  // Pinch-to-zoom on images and tables
  const { zoomedElement, resetZoom } = usePinchZoom(editAreaRef)

  // Virtual keyboard awareness
  useVirtualKeyboard(engine, editorRootRef)

  // Handle source mode toggle
  useEffect(() => {
    if (!engine) return
    const unsub = engine.eventBus.on('mode:change', ({ sourceMode: sm }) => {
      if (sm) {
        openModal('source')
      }
    })
    return unsub
  }, [engine, openModal])

  // Task 259: Merged keydown handlers (Cmd+F and Cmd+Shift+P) into a single useEffect
  useEffect(() => {
    if (!engine) return
    const handleKeyDown = (e) => {
      const mod = navigator.platform.includes('Mac') ? e.metaKey : e.ctrlKey
      if (mod && e.key === 'f') {
        e.preventDefault()
        openModal('findReplace')
      }
      if (showCommandPalette && mod && e.shiftKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault()
        setCommandPaletteOpen(prev => !prev)
      }
    }
    engine.element?.addEventListener('keydown', handleKeyDown)
    return () => engine.element?.removeEventListener('keydown', handleKeyDown)
  }, [engine, openModal, showCommandPalette])

  // Wire onError callback to engine error events
  useEffect(() => {
    if (!engine || !onError) return
    const unsubs = [
      engine.eventBus.on('plugin:error', ({ name, error }) => onError(error, { source: 'plugin', pluginName: name })),
      engine.eventBus.on('editor:error', ({ phase, error }) => onError(error, { source: 'engine', phase })),
      engine.eventBus.on('upload:error', ({ file, error }) => onError(error, { source: 'upload', file })),
    ]
    return () => unsubs.forEach(unsub => unsub())
  }, [engine, onError])

  const handleOpenModal = useCallback((name, data) => {
    if (name === 'commandPalette') {
      setCommandPaletteOpen(true)
      return
    }
    openModal(name, data)
  }, [openModal])

  // Command palette state
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  // Task 241: Consolidated content read — compute isEmpty from engine.getText() once
  const [isEmpty, setIsEmpty] = useState(true)
  useEffect(() => {
    if (!engine) return
    const check = () => {
      const text = engine.getText().trim()
      setIsEmpty(text === '' || text === '\n')
    }
    const unsub = engine.eventBus.on('content:change', check)
    check()
    return unsub
  }, [engine])

  // Split view state
  const [splitViewActive, setSplitViewActive] = useState(false)
  useEffect(() => {
    if (!engine) return
    const unsub = engine.eventBus.on('splitView:toggle', ({ active }) => setSplitViewActive(active))
    return unsub
  }, [engine])

  // Task 257: Memoize wordCountButton element
  const wordCountBtn = useMemo(() =>
    statusBar === 'popup' ? <WordCountButton engine={engine} /> : null,
    [statusBar, engine]
  )

  // Task 239: Memoize theme className
  const themeClassName = useMemo(() =>
    `rmx-editor rmx-theme-${/^[a-zA-Z0-9_-]+$/.test(theme) ? theme : 'light'} ${className || ''}`,
    [theme, className]
  )

  const editAreaStyle = useMemo(() => ({
    minHeight: minHeight || height,
    maxHeight: maxHeight || undefined,
    height: maxHeight ? undefined : height,
    overflowY: 'auto',
  }), [minHeight, height, maxHeight])

  const mergedStyle = useMemo(() =>
    customTheme ? { ...customTheme, ...style } : style,
    [customTheme, style]
  )

  const editorTree = (
    <SelectionContext.Provider value={formatState}>
    <div
      ref={editorRootRef}
      className={themeClassName}
      style={mergedStyle}
    >
      <a className="rmx-skip-link" href="#rmx-edit-area">
        Skip to editor content
      </a>

      {menuBarConfig && (
        <Suspense fallback={<div className="rmx-loading-spinner" />}>
          <MenuBar
            config={menuBarConfig}
            engine={engine}
            onOpenModal={handleOpenModal}
          />
        </Suspense>
      )}

      <Toolbar
        config={effectiveToolbar || toolbar}
        engine={engine}
        onOpenModal={handleOpenModal}
        fonts={mergedFonts}
        statusBarMode={statusBar}
        wordCountButton={wordCountBtn}
        toolbarItemTheme={toolbarItemTheme}
        customizableToolbar={customizableToolbarProp}
        onToolbarChange={onToolbarChange}
      />

      {autosaveConfig.enabled && autosaveConfig.showRecoveryBanner !== false && (
        <RecoveryBanner
          recoveryData={recoveryData}
          onRecover={recoverContent}
          onDismiss={dismissRecovery}
        />
      )}

      {showBreadcrumb && engine && (
        <BreadcrumbBar engine={engine} />
      )}

      {statusBar === 'top' && (
        <StatusBar
          engine={engine}
          position="top"
          saveStatus={saveStatus}
          showSaveStatus={autosaveConfig.enabled && autosaveConfig.showSaveStatus !== false}
        />
      )}

      <div className="rmx-editor-body" style={{ position: 'relative' }}>
        {emptyStateProp && isEmpty && !readOnly && (
          <EmptyState
            custom={emptyStateProp}
            onClick={() => engine?.focus()}
          />
        )}

        <EditArea
          ref={editAreaRef}
          style={editAreaStyle}
          readOnly={readOnly}
          id="rmx-edit-area"
        />

        {splitViewActive && engine && (
          <SplitPreview engine={engine} format={splitViewFormat} />
        )}

        {showMinimap && engine && (
          <Minimap engine={engine} editAreaRef={editAreaRef} />
        )}

        {showFloatingToolbar && (
          <FloatingToolbar
            visible={uiState.hasSelection}
            selectionRect={uiState.selectionRect}
            engine={engine}
            editorRect={editorRect}
            onOpenModal={handleOpenModal}
          />
        )}

        {uiState.focusedImage && (
          <ImageResizeHandles
            image={uiState.focusedImage}
            engine={engine}
            editorRect={editorRect}
          />
        )}

        {uiState.focusedTable && (
          <TableControls
            table={uiState.focusedTable}
            engine={engine}
            editorRect={editorRect}
          />
        )}

        {uiState.focusedCodeBlock && (
          <CodeBlockControls
            codeBlock={uiState.focusedCodeBlock}
            engine={engine}
            editorRect={editorRect}
          />
        )}

        {!readOnly && engine && (
          <BlockDragHandle
            engine={engine}
            editorRect={editorRect}
            editAreaRef={editAreaRef}
          />
        )}

        {zoomedElement && (
          <button
            className="rmx-pinch-zoom-reset"
            onClick={resetZoom}
            type="button"
            aria-label="Reset zoom"
          >
            Reset Zoom
          </button>
        )}

        <DropZoneOverlay
          visible={isExternalDrag}
          fileTypes={dragFileTypes}
        />

        <Suspense fallback={<div className="rmx-loading-spinner" />}>
          {modals.findReplace.open && (
            <FindReplacePanel
              open={modals.findReplace.open}
              onClose={() => closeModal('findReplace')}
              engine={engine}
            />
          )}
        </Suspense>
      </div>

      {statusBar === 'bottom' && (
        <StatusBar
          engine={engine}
          saveStatus={saveStatus}
          showSaveStatus={autosaveConfig.enabled && autosaveConfig.showSaveStatus !== false}
        />
      )}

      {showContextMenu && (
        <Suspense fallback={<div className="rmx-loading-spinner" />}>
          <ContextMenu
            contextMenu={contextMenu}
            onHide={hideContextMenu}
            onOpenModal={handleOpenModal}
          />
        </Suspense>
      )}

      {/* #39: Toast notifications */}
      {toastEl}

      {/* Item 22: Modals extracted to EditorModals sub-component */}
      <EditorModals
        modals={modals}
        closeModal={closeModal}
        engine={engine}
        showCommandPalette={showCommandPalette}
        commandPaletteOpen={commandPaletteOpen}
        setCommandPaletteOpen={setCommandPaletteOpen}
        handleOpenModal={handleOpenModal}
      />
    </div>
    </SelectionContext.Provider>
  )

  const wrappedTree = (
    <EditorErrorBoundary onError={onError} fallback={errorFallback}>
      {editorTree}
    </EditorErrorBoundary>
  )

  // When attachTo is provided, render via portal into the target's location
  if (attachTo) {
    if (!portalContainer) return null
    return createPortal(wrappedTree, portalContainer)
  }

  return wrappedTree
}
