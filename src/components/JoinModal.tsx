'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { generateParticipantId, storeParticipant } from '@/lib/utils'
import type { Session } from '@/types'

const avatarEmojis = [
  '😄', '😎', '🤩', '🥳', '😋', '🤗', '😼', '🦁',
  '🐯', '🦊', '🐻', '🐼', '🐨', '🦄', '🐸',
]

interface Props {
  session: Session
  onJoined: (p: { participantId: string; nickname: string; isHost: boolean }) => void
}

export default function JoinModal({ session, onJoined }: Props) {
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const avatarEmoji = nickname
    ? avatarEmojis[nickname.charCodeAt(0) % avatarEmojis.length]
    : '😄'

  async function join() {
    const name = nickname.trim()
    if (!name) {
      setError('Please enter a nickname')
      return
    }
    if (name.length > 20) {
      setError('Nickname too long (max 20 chars)')
      return
    }
    setLoading(true)
    setError('')

    const participantId = generateParticipantId()
    const { error: err } = await supabase.from('participants').insert({
      id: participantId,
      session_id: session.id,
      nickname: name,
      is_host: false,
    })

    if (err) {
      setError('Failed to join. Try again.')
      setLoading(false)
      return
    }

    storeParticipant(session.code, { participantId, nickname: name, isHost: false })
    onJoined({ participantId, nickname: name, isHost: false })
  }

  async function copyLink() {
    const url = `${window.location.origin}/session/${session.code}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-end sm:justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-bright w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 pb-10 animate-slide-up">
        {/* Handle bar (mobile) */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 sm:hidden" />

        <div className="text-center mb-6">
          <p className="text-white/50 text-sm mb-1">You&apos;re joining</p>
          <h2 className="text-4xl font-black tracking-widest gradient-text">{session.code}</h2>
        </div>

        {/* Avatar + nickname input */}
        <div className="flex items-center gap-3 mb-3">
          <div className="text-4xl w-14 h-14 flex items-center justify-center glass rounded-2xl flex-shrink-0">
            {avatarEmoji}
          </div>
          <input
            className="input-field"
            placeholder="Your nickname…"
            value={nickname}
            onChange={e => setNickname(e.target.value.slice(0, 20))}
            onKeyDown={e => e.key === 'Enter' && join()}
            autoFocus
          />
        </div>

        {error && <p className="text-red-400 text-sm mb-3 pl-1">{error}</p>}

        <button onClick={join} disabled={loading} className="btn-primary w-full mb-3">
          {loading ? 'Joining…' : `${avatarEmoji} Join the Group`}
        </button>

        <button onClick={copyLink} className="btn-secondary w-full text-sm">
          {copied ? '✅ Link Copied!' : '🔗 Copy Invite Link'}
        </button>
      </div>
    </div>
  )
}
