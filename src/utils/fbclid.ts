/**
 * Captura fbclid, UTMs, _fbc y _fbp para atribución completa de Meta Ads.
 *
 * fbclid       → generado por Meta al hacer click en un anuncio
 * fbc          → cookie estándar Meta: fb.1.{ts}.{fbclid}
 * fbp          → cookie de browser ID de Meta (generada por el Pixel)
 * utm_source   → ej. "facebook", "meta"
 * utm_medium   → ej. "paid_ad", "paid"
 * utm_campaign → ej. "yeyo-tofu-lead"
 * utm_content  → ID o nombre del anuncio
 * utm_term     → ID del adset (opcional)
 * utm_id       → ID numérico de la campaña (opcional)
 */

import { safeLocalStorage, safeSessionStorage } from '@/utils/storage'

const STORAGE_KEY = 'os_fb'


export interface FbParams {
  fbclid: string
  fbc: string
  fbp: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content: string
  utm_term: string
  utm_id: string
}

function getCookie(name: string): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : ''
}

function setCookie(name: string, value: string, maxAgeDays = 90): void {
  if (typeof document === 'undefined' || !value) return
  const maxAge = maxAgeDays * 24 * 60 * 60
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

function buildFbc(fbclid: string): string {
  return `fb.1.${Date.now()}.${fbclid}`
}

/**
 * Captura fbclid + UTMs de la URL y los persiste en sessionStorage y localStorage.
 * Genera y establece la cookie _fbc si se detecta fbclid.
 */
export function captureFbParams(): void {
  if (typeof window === 'undefined') return

  try {
    const params = new URLSearchParams(window.location.search)
    const urlFbclid = params.get('fbclid') ?? ''

    const existing = getStoredFbParams()

    // Usar fbclid nuevo si viene en URL, o mantener el guardado previamente
    const fbclid = urlFbclid || existing.fbclid || ''

    let fbc = getCookie('_fbc')
    if (urlFbclid) {
      fbc = buildFbc(urlFbclid)
      setCookie('_fbc', fbc)
    } else if (!fbc && fbclid) {
      fbc = buildFbc(fbclid)
      setCookie('_fbc', fbc)
    } else if (!fbc && existing.fbc) {
      fbc = existing.fbc
    }

    const fbp = getCookie('_fbp') || existing.fbp || ''
    if (fbp && !getCookie('_fbp')) {
      setCookie('_fbp', fbp)
    }

    const data: FbParams = {
      fbclid,
      fbc,
      fbp,
      utm_source:   params.get('utm_source')   || existing.utm_source   || '',
      utm_medium:   params.get('utm_medium')   || existing.utm_medium   || '',
      utm_campaign: params.get('utm_campaign') || existing.utm_campaign || '',
      utm_content:  params.get('utm_content')  || existing.utm_content  || '',
      utm_term:     params.get('utm_term')     || existing.utm_term     || '',
      utm_id:       params.get('utm_id')       || existing.utm_id       || '',
    }

    const json = JSON.stringify(data)
    safeSessionStorage.setItem(STORAGE_KEY, json)
    safeLocalStorage.setItem(STORAGE_KEY, json)
  } catch (err) {
    console.warn('[FBCLID] Error al capturar parámetros de atribución:', err)
  }
}

/**
 * Retorna todos los parámetros de atribución almacenados en esta sesión.
 * Incluye consulta dinámica de cookies _fbc y _fbp actualizadas por el Pixel.
 */
export function getStoredFbParams(): FbParams {
  if (typeof window === 'undefined') {
    return {
      fbclid: '', fbc: '', fbp: '',
      utm_source: '', utm_medium: '', utm_campaign: '',
      utm_content: '', utm_term: '', utm_id: '',
    }
  }

  try {
    const raw = safeSessionStorage.getItem(STORAGE_KEY) || safeLocalStorage.getItem(STORAGE_KEY)
    let stored: Partial<FbParams> = {}
    if (raw) {
      stored = JSON.parse(raw) as Partial<FbParams>
    }

    const cookieFbc = getCookie('_fbc')
    const cookieFbp = getCookie('_fbp')

    const fbclid = stored.fbclid || ''
    const fbc = cookieFbc || stored.fbc || (fbclid ? buildFbc(fbclid) : '')
    const fbp = cookieFbp || stored.fbp || ''

    return {
      fbclid,
      fbc,
      fbp,
      utm_source: stored.utm_source || '',
      utm_medium: stored.utm_medium || '',
      utm_campaign: stored.utm_campaign || '',
      utm_content: stored.utm_content || '',
      utm_term: stored.utm_term || '',
      utm_id: stored.utm_id || '',
    }
  } catch {
    return {
      fbclid: '', fbc: '', fbp: '',
      utm_source: '', utm_medium: '', utm_campaign: '',
      utm_content: '', utm_term: '', utm_id: '',
    }
  }
}
