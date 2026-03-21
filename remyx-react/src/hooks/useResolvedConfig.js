import { useMemo } from 'react'
import { useRemyxConfig } from './useRemyxConfig.js'
import { DEFAULT_TOOLBAR, DEFAULT_FONTS, DEFAULT_MENU_BAR, resolvePlugins } from '@remyxjs/core'
import { collectMenuBarCommands } from '../components/MenuBar/collectMenuBarCommands.js'

/** Default editor content area height in pixels */
export const DEFAULT_EDITOR_HEIGHT = 300

/**
 * Resolves editor configuration from props, context provider, and defaults.
 * Handles config merging, menu bar resolution, and toolbar auto-deduplication.
 */
export function useResolvedConfig(props) {
  const { config: configName, ...componentProps } = props

  // Resolve config from provider context (if any)
  const resolvedConfig = useRemyxConfig(configName)

  // Merge: resolved config as defaults, component props override where explicitly provided
  const merged = resolvedConfig
    ? Object.keys({ ...resolvedConfig, ...componentProps }).reduce((acc, key) => {
        acc[key] = componentProps[key] !== undefined ? componentProps[key] : resolvedConfig[key]
        return acc
      }, {})
    : componentProps

  // Destructure with defaults from the merged config
  const {
    attachTo,
    value,
    defaultValue,
    onChange,
    toolbar,
    menuBar: menuBarProp,
    theme = 'light',
    placeholder = '',
    height = DEFAULT_EDITOR_HEIGHT,
    minHeight,
    maxHeight,
    readOnly = false,
    plugins,
    onReady,
    onFocus,
    onBlur,
    className = '',
    style,
    uploadHandler,
    outputFormat = 'html',
    floatingToolbar: showFloatingToolbar = true,
    contextMenu: showContextMenu = true,
    fonts,
    googleFonts,
    statusBar = 'bottom',
    customTheme,
    toolbarItemTheme,
    sanitize,
    shortcuts,
    baseHeadingLevel,
    onError,
    errorFallback,
    commandPalette: showCommandPalette = true,
    autosave: autosaveProp = false,
    emptyState: emptyStateProp = false,
    breadcrumb: showBreadcrumb = false,
    minimap: showMinimap = false,
    splitViewFormat,
    customizableToolbar: customizableToolbarProp = false,
    onToolbarChange,
  } = merged

  // Resolve plugin names from config (strings/objects → plugin instances)
  const resolvedPlugins = useMemo(() => {
    if (!plugins || !Array.isArray(plugins)) return plugins
    const hasStringEntries = plugins.some(
      p => typeof p === 'string' || (typeof p === 'object' && p !== null && typeof p.name === 'string' && typeof p.init !== 'function')
    )
    if (hasStringEntries) {
      return resolvePlugins(plugins)
    }
    return plugins
  }, [plugins])

  // Task 247: Memoize autosaveConfig and menuBarConfig with separate useMemo calls
  const autosaveConfig = useMemo(() =>
    autosaveProp === true
      ? { enabled: true }
      : autosaveProp === false
        ? { enabled: false }
        : { enabled: true, ...autosaveProp },
    [autosaveProp]
  )

  const menuBarConfig = useMemo(() =>
    menuBarProp === true ? DEFAULT_MENU_BAR
      : Array.isArray(menuBarProp) ? menuBarProp
      : null,
    [menuBarProp]
  )

  // When both toolbar and menu bar are shown, keep the full toolbar intact.
  // The menu bar provides an alternative navigation layer, not a replacement.
  const effectiveToolbar = useMemo(() => {
    return toolbar || DEFAULT_TOOLBAR
  }, [toolbar])

  return useMemo(() => ({
    attachTo,
    value,
    defaultValue,
    onChange,
    toolbar,
    theme,
    placeholder,
    height,
    minHeight,
    maxHeight,
    readOnly,
    plugins: resolvedPlugins,
    onReady,
    onFocus,
    onBlur,
    className,
    style,
    uploadHandler,
    outputFormat,
    showFloatingToolbar,
    showContextMenu,
    fonts,
    googleFonts,
    statusBar,
    customTheme,
    toolbarItemTheme,
    sanitize,
    shortcuts,
    baseHeadingLevel,
    menuBarConfig,
    effectiveToolbar,
    onError,
    errorFallback,
    showCommandPalette,
    autosaveConfig,
    emptyState: emptyStateProp,
    showBreadcrumb,
    showMinimap,
    splitViewFormat,
    customizableToolbar: customizableToolbarProp,
    onToolbarChange,
  }), [
    attachTo, value, defaultValue, onChange, toolbar, theme, placeholder,
    height, minHeight, maxHeight, readOnly, resolvedPlugins, onReady, onFocus, onBlur,
    className, style, uploadHandler, outputFormat, showFloatingToolbar,
    showContextMenu, fonts, googleFonts, statusBar, customTheme, toolbarItemTheme,
    sanitize, shortcuts, baseHeadingLevel, menuBarConfig, effectiveToolbar,
    onError, errorFallback, showCommandPalette, autosaveConfig,
    emptyStateProp, showBreadcrumb, showMinimap, splitViewFormat,
    customizableToolbarProp, onToolbarChange,
  ])
}
