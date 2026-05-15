'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session, Participant, IdeaWithVotes } from '@/types'
import type { StoredParticipant } from '@/lib/utils'

interface Props {
  session: Session
  ideasWithVotes: IdeaWithVotes[]
  participants: Participant[]
  storedParticipant: StoredParticipant
}

export default function VotingPhase({
  session,
  ideasWithVotes,
  participants,
  storedParticipant,
}: Props) {
  const [voting, setVoting] = useState<string | null>(null)
  const [revealing, setRevealing] = useState(false)

  const isHost = storedParticipant.isHost
  const totalVotes = ideasWithVotes.reduce((sum, i) => sum + i.vote_count, 0)
  const myVoteCount = ideasWithVotes.filter(i => i.has_voted).length

  async function castVote(ideaId: string) {
    setVoting(ideaId)
    await supabase.from('votes').insert({
      idea_id: ideaId,
      participant_id: storedParticipant.participantId,
    })
    setVoting(null)
  }

  async function revealResults() {
    setRevealing(true)
    await supabase.from('sessions').update({ phase: 'results' }).eq('id', session.id)
    setRevealing(false)
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Header */}
      <div className="relative z-10 px-4 pt-6 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest">Voting</p>
            <h2 className="text-2xl font-black tracking-widest gradient-text">{session.code}</h2>
          </div>
          <div className="glass rounded-full px-3 py-1.5 text-sm text-white/60">
            {participants.length} 👥
          </div>
        </div>

        <h1 className="text-3xl font-black mb-1">
          Cast your <span className="gradient-text">vote!</span>
        </h1>
        <p className="text-white/40 text-sm">
          {myVoteCount > 0
            ? `You've voted on ${myVoteCount} idea${myVoteCount !== 1 ? 's' : ''}`
            : 'Tap an idea to vote'}
          {' · '}
          {totalVotes} vote{totalVotes !== 1 ? 's' : ''} cast
        </p>

        <div className="mt-3 glass rounded-2xl px-4 py-2 text-amber-400/80 text-xs text-center">
          🔒 Vote tallies hidden until results are revealed
        </div>
      </div>

      {/* Idea list */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-48 mt-4">
        <div className="flex flex-col gap-3">
          {ideasWithVotes.map((idea, idx) => (
            <VoteCard
              key={idea.id}
              idea={idea}
              participants={participants}
              onVote={() => castVote(idea.id)}
              isVoting={voting === idea.id}
              idx={idx}
            />
          ))}
        </div>
      </div>

      {/* Host bottom controls */}
      {isHost && (
        <div className="fixed bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-[#07070f] via-[#07070f]/90 to-transparent pt-8">
          <button
            onClick={revealResults}
            disabled={revealing || totalVotes === 0}
            className="btn-success w-full disabled:opacity-40"
          >
            {revealing
              ? 'Revealing…'
              : totalVotes === 0
              ? 'Waiting for votes…'
              : '🎉 Reveal Results'}
          </button>
          {totalVotes === 0 && (
            <p className="text-white/30 text-xs text-center mt-2">
              Wait for the group to vote first
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function VoteCard({
  idea,
  participants,
  onVote,
  isVoting,
  idx,
}: {
  idea: IdeaWithVotes
  participants: Participant[]
  onVote: () => void
  isVoting: boolean
  idx: number
}) {
  const submitter = participants.find(p => p.id === idea.participant_id)

  return (
    <div
      className={`glass-bright rounded-2xl p-4 flex items-center gap-4 animate-slide-up transition-all duration-300 ${
        idea.has_voted ? 'border-green-500/30 bg-green-500/5' : ''
      }`}
      style={{ animationDelay: `${idx * 50}ms` }}
    >
      <div className="text-4xl flex-shrink-0">{idea.emoji || '🍽️'}</div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-lg leading-tight truncate">{idea.text}</p>
        <p className="text-white/30 text-xs mt-0.5">{submitter?.nickname ?? 'Guest'}</p>
      </div>
      <button
        onClick={onVote}
        disabled={idea.has_voted || isVoting}
        className={`flex-shrink-0 w-16 h-16 rounded-2xl font-black text-xl transition-all duration-200 active:scale-90 ${
          idea.has_voted
            ? 'bg-green-500/20 border-2 border-green-500/40 text-green-400 cursor-default'
            : isVoting
            ? 'bg-indigo-500/20 border-2 border-indigo-500/40 text-white/50'
            : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30'
        }`}
      >
        {idea.has_voted ? '✓' : isVoting ? '…' : '+1'}
      </button>
    </div>
  )
}
