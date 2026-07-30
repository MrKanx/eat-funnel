/**
 * Encapsulado seguro para localStorage y sessionStorage con fallback en memoria.
 * Evita que la aplicación falle en iOS In-App Browsers, modo privado o webviews restringidas.
 */

const memoryStore = new Map<string, string>()

export const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key)
      }
    } catch { /* fallback a memoria */ }
    return memoryStore.get(`local_${key}`) ?? null
  },
  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value)
        return
      }
    } catch { /* fallback a memoria */ }
    memoryStore.set(`local_${key}`, value)
  },
  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key)
        return
      }
    } catch { /* fallback a memoria */ }
    memoryStore.delete(`local_${key}`)
  }
}

export const safeSessionStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return window.sessionStorage.getItem(key)
      }
    } catch { /* fallback a memoria */ }
    return memoryStore.get(`session_${key}`) ?? null
  },
  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(key, value)
        return
      }
    } catch { /* fallback a memoria */ }
    memoryStore.set(`session_${key}`, value)
  },
  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(key)
        return
      }
    } catch { /* fallback a memoria */ }
    memoryStore.delete(`session_${key}`)
  }
}
