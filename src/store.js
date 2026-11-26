import { useEffect, useState } from 'react'

// MVP storage: everything lives in this browser's localStorage.
const KEYS = { profile: 'as.profile', inquiries: 'as.inquiries', language: 'as.language' }

export const emptyProfile = {
  name: '',
  location: '',
  phone: '',
  timings: '',
  courses: [{ name: '', fee: '', duration: '', timing: '', notes: '' }],
  faqs: [{ q: '', a: '' }],
  extra: '',
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function useStored(key, fallback) {
  const [value, setValue] = useState(() => read(key, fallback))
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage full or blocked: keep in memory */
    }
  }, [key, value])
  return [value, setValue]
}

export const useProfile = () => useStored(KEYS.profile, emptyProfile)
export const useInquiries = () => useStored(KEYS.inquiries, [])
export const useLanguage = () => useStored(KEYS.language, 'hinglish')

export function isProfileReady(p) {
  return Boolean(p?.name?.trim() && p.courses?.some((c) => c.name?.trim()))
}

export async function callApi(path, payload) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Server error (${res.status})`)
  return data.text
}

export function todayISO(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d - tz).toISOString().slice(0, 10)
}

export function whatsappLink(text, phone) {
  const digits = (phone || '').replace(/\D/g, '')
  const number = digits.length === 10 ? `91${digits}` : digits
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}

export const LANGUAGES = [
  { id: 'hinglish', label: 'Hinglish' },
  { id: 'hindi', label: 'हिंदी' },
  { id: 'english', label: 'English' },
]

export function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
