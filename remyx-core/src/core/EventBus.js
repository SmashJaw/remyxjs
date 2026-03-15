export class EventBus {
  constructor() {
    this._listeners = new Map()
  }

  on(event, handler) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set())
    }
    this._listeners.get(event).add(handler)
    return () => this.off(event, handler)
  }

  off(event, handler) {
    const handlers = this._listeners.get(event)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        this._listeners.delete(event)
      }
    }
  }

  once(event, handler) {
    const wrapper = (...args) => {
      this.off(event, wrapper)
      handler(...args)
    }
    return this.on(event, wrapper)
  }

  emit(event, data) {
    const handlers = this._listeners.get(event)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data)
        } catch (err) {
          console.error(`EventBus error in "${event}" handler:`, err)
        }
      })
    }
  }

  removeAllListeners(event) {
    if (event) {
      this._listeners.delete(event)
    } else {
      this._listeners.clear()
    }
  }
}
