import { defineStore } from 'pinia'
import { ref } from 'vue'
import { safeLocalStorage } from '@/utils/storage'

export interface BkContact {
  nombre: string
  apellido: string
  negocio: string
  email: string
  telefono: string
  timestamp?: number
}

const STORAGE_KEY = 'os_contact'

export const useContactStore = defineStore('contact', () => {
  const contact = ref<BkContact>({
    nombre: '',
    apellido: '',
    negocio: '',
    email: '',
    telefono: '',
  })

  // Hidrata desde localStorage al iniciar
  const stored = safeLocalStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      Object.assign(contact.value, JSON.parse(stored))
    } catch { /* ignorar */ }
  }

  function save(data: Partial<BkContact>) {
    Object.assign(contact.value, data, { timestamp: Date.now() })
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(contact.value))
  }

  function get(): BkContact {
    return { ...contact.value }
  }

  function clear() {
    contact.value = { nombre: '', apellido: '', negocio: '', email: '', telefono: '' }
    safeLocalStorage.removeItem(STORAGE_KEY)
  }

  return { contact, save, get, clear }
})
