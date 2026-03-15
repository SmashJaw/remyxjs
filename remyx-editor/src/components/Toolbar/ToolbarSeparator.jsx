import React from 'react'

export const ToolbarSeparator = React.memo(function ToolbarSeparator({ separatorStyle }) {
  return <div className="rmx-toolbar-separator" role="separator" style={separatorStyle || undefined} />
})
