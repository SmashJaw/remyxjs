import React, { useState, useRef, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { ChevronDownIcon } from '../../icons/index.jsx'

export const ToolbarDropdown = React.memo(function ToolbarDropdown({ label, value, options, onChange, tooltip, icon: Icon, width = 120, itemStyle }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const currentOption = options.find((o) => o.value === value)
  const displayLabel = currentOption?.label || label

  const handleToggle = useCallback((e) => {
    e.preventDefault()
    setOpen(prev => !prev)
  }, [])

  const handleMouseDown = useCallback((e) => e.preventDefault(), [])

  return (
    <div className="rmx-toolbar-dropdown" ref={ref} style={{ minWidth: width, ...itemStyle }}>
      <button
        className={`rmx-toolbar-btn rmx-toolbar-dropdown-btn`}
        onClick={handleToggle}
        onMouseDown={handleMouseDown}
        title={tooltip}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {Icon && <Icon size={16} />}
        <span className="rmx-toolbar-dropdown-label">{displayLabel}</span>
        <ChevronDownIcon size={14} />
      </button>
      {open && (
        <div className="rmx-toolbar-dropdown-menu" role="listbox">
          {options.map((option) => (
            <button
              key={option.value}
              className={`rmx-toolbar-dropdown-item ${option.value === value ? 'rmx-active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                onChange(option.value)
                setOpen(false)
              }}
              onMouseDown={handleMouseDown}
              role="option"
              aria-selected={option.value === value}
              type="button"
              style={option.style}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
})

ToolbarDropdown.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      style: PropTypes.object,
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  tooltip: PropTypes.string,
  icon: PropTypes.elementType,
  width: PropTypes.number,
  itemStyle: PropTypes.object,
}
