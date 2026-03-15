import React, { useCallback } from 'react'
import { ICON_MAP } from '../../icons/index.jsx'

export const ToolbarButton = React.memo(function ToolbarButton({ command, icon, tooltip, active, disabled, onClick, shortcutLabel, children, itemStyle }) {
  const IconComponent = children ? null : ICON_MAP[icon || command]

  const handleClick = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) onClick?.()
  }, [disabled, onClick])

  const handleMouseDown = useCallback((e) => e.preventDefault(), [])

  return (
    <button
      className={`rmx-toolbar-btn ${active ? 'rmx-active' : ''} ${disabled ? 'rmx-disabled' : ''}`}
      style={itemStyle || undefined}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      title={shortcutLabel ? `${tooltip} (${shortcutLabel})` : tooltip}
      disabled={disabled}
      type="button"
      aria-pressed={active}
      aria-label={tooltip}
    >
      {children || (IconComponent ? <IconComponent size={18} /> : command)}
    </button>
  )
})
