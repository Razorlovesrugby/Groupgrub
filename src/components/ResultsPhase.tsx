'use client'
import { useEffect, useRef } from 'react'
import type { Session, Participant, IdeaWithVotes } from '@/types'
import { getMapsUrl } from '@/lib/utils'

interface Props {
  session: Session
  ideasWithVotes: IdeaWithVotes[]
  participants: Participant[]
}

export default function ResultsPhase({ session, ideasWithVotes, participants }: Props) {
  const confettiFired = useRef(false)

  const sorted = [...ideasWithVotes].sort((a, b) => b.vote_count - a.vote_count)
  const winner = sorted[0]
  const rest = sorted.slice(1)

  useEffect(() => {
    if (confettiFired.current) return
    confettiFired.current = true

    import('canvas-confetti').then(({ default: confetti }) => {
      const end = Date.now() + 3000
      const colors = ['#818cf8', '#c084fc', '#f472b6', '#22c55e', '#f59e0b']

      function frame() {
        confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors })
        confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()
    })
  }, [])

  function handleFindPlaces() {
    if (!winner) return
    const mapsUrl = getMapsUrl(winner.text)
    window.open(mapsUrl, '_blank')
  }

  const totalVotes = ideasWithVotes.reduce((sum, i) => sum + i.vote_count, 0)

  return (
    <div className="relative min-h-screen flex flex-col px-4 pt-6 pb-12 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest">Results</p>
          <h2 className="text-2xl font-black tracking-widest gradient-text">{session.code}</h2>
        </div>
        <div className="glass rounded-full px-3 py-1.5 text-sm text-white/60">
          {participants.length} 👥 · {totalVotes} votes
        </div>
      </div>

      {/* Winner announcement */}
      <div className="text-center mb-6 animate-bounce-in">
        <p className="text-white/50 text-sm mb-1">🏆 The group has decided…</p>
        <h1 className="text-4xl font-black gradient-text mb-2">We&apos;re having</h1>
      </div>

      {winner && (
        <div className="glass-bright rounded-3xl p-6 mb-6 text-center glow-gold border-amber-500/30 border animate-bounce-in">
          <div className="text-7xl mb-3">{winner.emoji || '🍽️'}</div>
          <h2 className="text-3xl font-black text-white mb-1">{winner.text}</h2>
          <p className="text-amber-400 font-semibold">
            {winner.vote_count} vote{winner.vote_count !== 1 ? 's' : ''}
            {totalVotes > 0 ? ` · ${Math.round((winner.vote_count / totalVotes) * 100)}%` : ''}
          </p>
        </div>
      )}

      {/* Find places CTA */}
      <button
        onClick={handleFindPlaces}
        className="btn-primary w-full mb-3 glow-indigo text-xl py-5"
      >
        📍 Find Places Near Me
      </button>

      <a href="/" className="btn-secondary w-full text-center block mb-8">
        🔄 Start a New Vote
      </a>

      {/* Ranked results */}
      {rest.length > 0 && (
        <div>
          <p className="text-white/30 text-sm uppercase tracking-widest mb-3">Full results</p>
          <div className="flex flex-col gap-3">
            {rest.map((idea, idx) => {
              const submitter = participants.find(p => p.id === idea.participant_id)
              const pct =
                totalVotes > 0 ? Math.round((idea.vote_count / totalVotes) * 100) : 0
              return (
                <div
                  key={idea.id}
                  className="glass rounded-2xl p-4 flex items-center gap-4 animate-slide-up"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <span className="text-white/30 font-black text-lg w-6 text-center">
                    #{idx + 2}
                  </span>
                  <div className="text-3xl">{idea.emoji || '🍽️'}</div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{idea.text}</p>
                    <p className="text-white/30 text-xs">{submitter?.nickname ?? 'Guest'}</p>
                    <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500/50 rounded-full transition-all duration-1000"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-white/60 font-bold text-sm">{idea.vote_count}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
