// Main component
export { default as RemyxEditor } from './components/RemyxEditor.jsx'

// Hooks
export { useRemyxEditor } from './hooks/useRemyxEditor.js'

// Core engine for advanced usage
export { EditorEngine } from './core/EditorEngine.js'
export { EventBus } from './core/EventBus.js'

// Plugin creation
export { createPlugin } from './plugins/createPlugin.js'

// Built-in plugins
export { WordCountPlugin } from './plugins/builtins/WordCountPlugin.js'
export { AutolinkPlugin } from './plugins/builtins/AutolinkPlugin.js'
export { PlaceholderPlugin } from './plugins/builtins/PlaceholderPlugin.js'

// Markdown conversion utilities
export { htmlToMarkdown, markdownToHtml } from './utils/markdownConverter.js'

// Paste utilities
export { cleanPastedHTML, looksLikeMarkdown } from './utils/pasteClean.js'

// Constants for consumer customization
export { DEFAULT_TOOLBAR, DEFAULT_MENU_BAR, DEFAULT_FONTS, DEFAULT_FONT_SIZES, DEFAULT_COLORS } from './constants/defaults.js'
export { DEFAULT_KEYBINDINGS } from './constants/keybindings.js'

// Toolbar configuration utilities
export { TOOLBAR_PRESETS, removeToolbarItems, addToolbarItems, createToolbar } from './utils/toolbarConfig.js'

// Font configuration utilities
export { removeFonts, addFonts, loadGoogleFonts } from './utils/fontConfig.js'

// Theme configuration utilities
export { createTheme, THEME_VARIABLES, THEME_PRESETS } from './utils/themeConfig.js'
export { createToolbarItemTheme, resolveToolbarItemStyle, TOOLBAR_ITEM_STYLE_KEYS } from './utils/themeConfig.js'

// Config file support
export { defineConfig } from './config/defineConfig.js'
export { RemyxConfigProvider } from './config/RemyxConfigProvider.jsx'
