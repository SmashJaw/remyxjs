import React, { useMemo } from 'react'
import RemyxEditor from './RemyxEditor.jsx'
import { useExternalConfig } from '../hooks/useExternalConfig.js'
import { resolvePlugins } from '@remyxjs/core'

/**
 * Fully declarative editor setup from an external JSON/YAML config URL.
 *
 * Loads the config asynchronously, shows a loading state until ready,
 * and renders <RemyxEditor /> with the loaded configuration merged with
 * any additional props passed directly.
 *
 * Supports runtime config reloading: when the config URL changes or
 * `pollInterval` is set, the editor re-renders with the updated config.
 *
 * Usage:
 *   <RemyxEditorFromConfig
 *     url="/editor-config.json"
 *     env="production"
 *     value={content}
 *     onChange={setContent}
 *   />
 *
 * @param {object} props
 * @param {string} props.url - URL to a JSON/YAML config file
 * @param {string} [props.env] - Environment name for config merging
 * @param {Record<string, string>} [props.fetchHeaders] - Custom headers for config fetch
 * @param {number} [props.pollInterval] - Auto-reload interval in ms (0 = disabled)
 * @param {(config: object) => void} [props.onConfigLoad] - Callback when config is loaded
 * @param {(error: Error) => void} [props.onConfigError] - Callback on load error
 * @param {React.ReactNode} [props.loadingFallback] - Custom loading UI (default: null)
 * @param {React.ReactNode} [props.errorFallback] - Custom error UI (default: error message)
 * @param {...*} props.rest - All other props are forwarded to <RemyxEditor />
 */
export function RemyxEditorFromConfig({
  url,
  env,
  fetchHeaders,
  pollInterval,
  onConfigLoad,
  onConfigError,
  loadingFallback = null,
  errorFallback: errorFallbackProp,
  ...editorProps
}) {
  const { config, loading, error, reload } = useExternalConfig(url, {
    env,
    headers: fetchHeaders,
    pollInterval,
    onLoad: onConfigLoad,
    onError: onConfigError,
  })

  if (loading && !config) {
    return loadingFallback
  }

  if (error && !config) {
    if (errorFallbackProp !== undefined) {
      return typeof errorFallbackProp === 'function'
        ? errorFallbackProp({ error, reload })
        : errorFallbackProp
    }
    return (
      <div className="rmx-config-error" role="alert">
        <p>Failed to load editor configuration.</p>
        <button onClick={reload} type="button">Retry</button>
      </div>
    )
  }

  // Merge: loaded config as defaults, direct props override
  const mergedProps = config
    ? Object.keys({ ...config, ...editorProps }).reduce((acc, key) => {
        acc[key] = editorProps[key] !== undefined ? editorProps[key] : config[key]
        return acc
      }, {})
    : editorProps

  // Resolve plugin names from config (strings/objects → plugin instances)
  // Only resolve if plugins came from config (not from direct props)
  const resolvedPlugins = useMemo(() => {
    if (editorProps.plugins !== undefined) return editorProps.plugins
    if (mergedProps.plugins && Array.isArray(mergedProps.plugins)) {
      const hasStringEntries = mergedProps.plugins.some(
        p => typeof p === 'string' || (typeof p === 'object' && p !== null && typeof p.name === 'string' && typeof p.init !== 'function')
      )
      if (hasStringEntries) {
        return resolvePlugins(mergedProps.plugins)
      }
    }
    return mergedProps.plugins
  }, [mergedProps.plugins, editorProps.plugins])

  return <RemyxEditor {...mergedProps} plugins={resolvedPlugins} />
}
