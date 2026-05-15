'use client'
import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { getEmoji, isDuplicate } from '@/lib/emoji'
import type { Session, Participant, Idea } from '@/types'
import type { StoredParticipant } from '@/lib/utils'

interface Props {
  session: Session
  ideas: Idea[]
  participants: Participant[]
  storedParticipant: StoredParticipant
}

export default function BrainstormPhase({ session, ideas, participants, storedParticipant }: Props) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [locking, setLocking] = useState(false)
  const [dupWarning, setDupWarning] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const isHost = storedParticipant.isHost

  async function submitIdea() {
    const trimmed = text.trim()
    if (!trimmed) return

    if (isDuplicate(trimmed, ideas.map(i => i.text))) {
      setDupWarning(true)
      setTimeout(() => setDupWarning(false), 3000)
      return
    }

    setSubmitting(true)
    setError('')
    const emoji = getEmoji(trimmed)
    const { error: err } = await supabase.from('ideas').insert({
      session_id: session.id,
      participant_id: storedParticipant.participantId,
      text: trimmed,
      emoji,
    })
    if (!err) {
      setText('')
      inputRef.current?.focus()
    } else {
      setError('Failed to add idea')
    }
    setSubmitting(false)
  }

  async function lockAndStartVoting() {
    setLocking(true)
    await supabase.from('sessions').update({ phase: 'voting' }).eq('id', session.id)
    setLocking(false)
  }

  const myIdeas = ideas.filter(i => i.participant_id === storedParticipant.participantId)

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Header */}
      <div className="relative z-10 px-4 pt-6 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest">Session</p>
            <h2 className="text-2xl font-black tracking-widest gradient-text">{session.code}</h2>
          </div>
          <div className="flex -space-x-2">
            {participants.slice(0, 5).map((p, i) => (
              <div
                key={p.id}
                className="w-9 h-9 rounded-full glass-bright border-2 border-white/10 flex items-center justify-center text-sm font-bold"
                title={p.nickname}
                style={{ zIndex: 5 - i }}
              >
                {p.nickname.charAt(0).toUpperCase()}
              </div>
            ))}
            {participants.length > 5 && (
              <div className="w-9 h-9 rounded-full glass-bright border-2 border-white/10 flex items-center justify-center text-xs text-white/60">
                +{participants.length - 5}
              </div>
            )}
          </div>
        </div>

        <h1 className="text-3xl font-black leading-tight mb-1">
          What are we<br />
          <span className="gradient-text">eating tonight?</span>
        </h1>
        <p className="text-white/40 text-sm">
          {ideas.length} idea{ideas.length !== 1 ? 's' : ''} · {participants.length} in the group
        </p>
      </div>

      {/* Ideas grid */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-48">
        {ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4 animate-float">💭</div>
            <p className="text-white/30 text-lg">
              No ideas yet.<br />Be the first to suggest something!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {ideas.map((idea, idx) => (
              <IdeaBubble
                key={idea.id}
                idea={idea}
                participants={participants}
                isOwn={idea.participant_id === storedParticipant.participantId}
                idx={idx}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom input area */}
      <div className="fixed bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-[#07070f] via-[#07070f]/90 to-transparent pt-8">
        {dupWarning && (
          <div className="glass rounded-2xl px-4 py-2 mb-3 text-amber-400 text-sm text-center animate-slide-up">
            ⚠️ That idea&apos;s already on the board!
          </div>
        )}
        {error && (
          <p className="text-red-400 text-sm text-center mb-2">{error}</p>
        )}

        {isHost && ideas.length >= 2 && (
          <button
            onClick={lockAndStartVoting}
            disabled={locking}
            className="btn-success w-full mb-3"
          >
            {locking ? 'Starting vote…' : '🔒 Lock Ideas & Start Voting'}
          </button>
        )}

        {isHost && ideas.length < 2 && (
          <div className="glass rounded-2xl px-4 py-2 mb-3 text-white/40 text-sm text-center">
            Add at least 2 ideas to start voting
          </div>
        )}

        <div className="flex gap-2">
          <input
            ref={inputRef}
            className="input-field flex-1"
            placeholder="Suggest something… (e.g. Tacos)"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !submitting && submitIdea()}
            maxLength={80}
            disabled={submitting}
          />
          <button
            onClick={submitIdea}
            disabled={submitting || !text.trim()}
            className="btn-primary px-5 py-4 text-xl disabled:opacity-40"
          >
            {submitting ? '…' : '→'}
          </button>
        </div>

        {myIdeas.length > 0 && (
          <p className="text-white/25 text-xs text-center mt-2">
            You&apos;ve suggested {myIdeas.length} idea{myIdeas.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  )
}

function IdeaBubble({
  idea,
  participants,
  isOwn,
  idx,
}: {
  idea: Idea
  participants: Participant[]
  isOwn: boolean
  idx: number
}) {
  const submitter = participants.find(p => p.id === idea.participant_id)
  return (
    <div
      className={`glass-bright rounded-2xl p-4 animate-pop-in ${
        isOwn ? 'border-indigo-500/30' : ''
      }`}
      style={{ animationDelay: `${idx * 30}ms` }}
    >
      <div className="text-3xl mb-2">{idea.emoji || '🍽️'}</div>
      <p className="text-white font-semibold text-base leading-tight mb-1">{idea.text}</p>
      <p className="text-white/30 text-xs">{submitter?.nickname ?? 'Guest'}</p>
    </div>
  )
}
