'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { generateSessionCode, generateParticipantId, storeParticipant } from '@/lib/utils'

export default function LandingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')

  async function startSession() {
    setLoading(true)
    setError('')
    try {
      const code = generateSessionCode()
      const participantId = generateParticipantId()
      const hostNickname = 'Host'

      const { error: sessionError } = await supabase.from('sessions').insert({
        code,
        host_id: participantId,
        phase: 'brainstorming',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      if (sessionError) throw sessionError

      const { data: sessionData } = await supabase
        .from('sessions')
        .select('id')
        .eq('code', code)
        .single()
      if (!sessionData) throw new Error('Session not found')

      const { error: participantError } = await supabase.from('participants').insert({
        id: participantId,
        session_id: sessionData.id,
        nickname: hostNickname,
        is_host: true,
      })
      if (participantError) throw participantError

      storeParticipant(code, { participantId, nickname: hostNickname, isHost: true })
      router.push(`/session/${code}`)
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  function joinSession() {
    const code = joinCode.trim().toUpperCase()
    if (code.length < 4) {
      setError('Enter a valid session code')
      return
    }
    router.push(`/session/${code}`)
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
      {/* Background orbs */}
      <div className="orb w-96 h-96 bg-indigo-600/30 -top-20 -left-20" />
      <div className="orb w-80 h-80 bg-purple-600/20 top-1/3 -right-20" />
      <div className="orb w-64 h-64 bg-pink-600/15 bottom-10 left-1/4" />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center">
        {/* Logo emoji */}
        <div className="text-7xl mb-6 animate-float" role="img" aria-label="dinner plate">
          🍽️
        </div>

        {/* Title */}
        <h1 className="text-5xl font-black tracking-tight mb-3">
          <span className="gradient-text">GroupGrub</span>
        </h1>

        {/* Tagline */}
        <p className="text-white/60 text-xl leading-relaxed mb-10">
          End dinner debates.<br />
          <span className="text-white/90 font-semibold">Start eating.</span>
        </p>

        {/* CTA */}
        <button
          onClick={startSession}
          disabled={loading}
          className="btn-primary w-full glow-indigo mb-4 relative overflow-hidden"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Creating session…
            </span>
          ) : (
            '🍴 Start a Dinner Vote'
          )}
        </button>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {/* Join section */}
        <div className="w-full mt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-sm">Already have a code?</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <div className="flex gap-2">
            <input
              className="input-field flex-1 text-center uppercase tracking-widest text-base"
              placeholder="ABC123"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
              onKeyDown={e => e.key === 'Enter' && joinSession()}
              maxLength={6}
            />
            <button
              onClick={joinSession}
              className="btn-secondary px-5 py-4 text-base"
            >
              Join
            </button>
          </div>
        </div>

        <p className="text-white/20 text-xs mt-10">No signup required · Free forever</p>
      </div>
    </div>
  )
}
