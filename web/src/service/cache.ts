let storage: any = localStorage || {}

export default {
  get(key: string, defaultValue?: any) {
    const value: any = storage[key]
    if (void 0 === value && defaultValue) {
      this.set(key, defaultValue)
      return defaultValue
    } else {
      try {
        return JSON.parse(value)
      } catch (e) {
        return storage[key]
      }
    }
  },
  set(key: string, value: any) {
    if (typeof value === 'object') {
      storage[key] = JSON.stringify(value)
    } else {
      storage[key] = value
    }
  },
  remove(key: string) {
    delete storage[key]
  },
  clear() {
    storage.clear ? storage.clear() : storage = {}
  }
}