export function generateSessionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function generateParticipantId(): string {
  return crypto.randomUUID()
}

export function getStorageKey(sessionCode: string) {
  return `groupgrub_${sessionCode}`
}

export interface StoredParticipant {
  participantId: string
  nickname: string
  isHost: boolean
}

export function getStoredParticipant(sessionCode: string): StoredParticipant | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(getStorageKey(sessionCode))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function storeParticipant(sessionCode: string, data: StoredParticipant) {
  if (typeof window === 'undefined') return
  localStorage.setItem(getStorageKey(sessionCode), JSON.stringify(data))
}

export function getMapsUrl(query: string): string {
  const encoded = encodeURIComponent(query)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  if (isIOS) {
    return `maps://maps.apple.com/?q=${encoded}`
  }
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`
}
