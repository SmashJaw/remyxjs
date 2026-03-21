import { useState, useEffect, useCallback, useRef } from 'react'
import { loadConfig } from '@remyxjs/core'

/**
 * Hook that loads a RemyxEditor configuration from an external URL.
 *
 * Features:
 * - Fetches JSON or YAML config from a URL
 * - Environment-based config merging (pass `env` option)
 * - Runtime config reloading via returned `reload()` function
 * - Automatic reload on URL change
 * - Polling-based auto-reload via `pollInterval` option
 * - Loading/error state tracking
 *
 * @param {string} url - URL to fetch configuration from
 * @param {object} [options]
 * @param {string} [options.env] - Environment name for config merging
 * @param {Record<string, string>} [options.headers] - Custom fetch headers
 * @param {number} [options.pollInterval] - Auto-reload interval in ms (0 = disabled)
 * @param {(config: object) => void} [options.onLoad] - Callback when config is loaded
 * @param {(error: Error) => void} [options.onError] - Callback on load error
 * @returns {{ config: object|null, loading: boolean, error: Error|null, reload: () => Promise<void> }}
 */
export function useExternalConfig(url, options = {}) {
  const { env, headers, pollInterval = 0, onLoad, onError } = options
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(!!url)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  // Item 5: Move callback/object deps to refs to avoid infinite re-fetch
  const onLoadRef = useRef(onLoad)
  onLoadRef.current = onLoad
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError
  const headersRef = useRef(headers)
  headersRef.current = headers

  const fetchConfig = useCallback(async () => {
    if (!url) {
      setConfig(null)
      setLoading(false)
      return
    }

    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort()
    }
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    try {
      const result = await loadConfig(url, {
        env,
        headers: headersRef.current,
        signal: controller.signal,
      })

      if (!controller.signal.aborted) {
        setConfig(result)
        setLoading(false)
        onLoadRef.current?.(result)
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err)
        setLoading(false)
        onErrorRef.current?.(err)
      }
    }
  }, [url, env])

  // Initial load and reload on URL/env change
  useEffect(() => {
    fetchConfig()
    return () => {
      if (abortRef.current) {
        abortRef.current.abort()
      }
    }
  }, [fetchConfig])

  // Polling-based auto-reload
  useEffect(() => {
    if (!pollInterval || pollInterval <= 0 || !url) return
    const interval = setInterval(fetchConfig, pollInterval)
    return () => clearInterval(interval)
  }, [pollInterval, fetchConfig, url])

  return { config, loading, error, reload: fetchConfig }
}
