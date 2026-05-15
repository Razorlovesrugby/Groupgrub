'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getStoredParticipant } from '@/lib/utils'
import type { Session, Participant, Idea, Vote, IdeaWithVotes } from '@/types'
import type { StoredParticipant } from '@/lib/utils'
import JoinModal from './JoinModal'
import BrainstormPhase from './BrainstormPhase'
import VotingPhase from './VotingPhase'
import ResultsPhase from './ResultsPhase'

interface Props {
  code: string
}

export default function SessionPage({ code }: Props) {
  const [session, setSession] = useState<Session | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [storedParticipant, setStoredParticipant] = useState<StoredParticipant | null>(null)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const loadSession = useCallback(async () => {
    const { data: sessionData } = await supabase
      .from('sessions')
      .select('*')
      .eq('code', code)
      .single()

    if (!sessionData) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setSession(sessionData)

    // Load ideas first so we can get their ids for votes
    const { data: ideasData } = await supabase
      .from('ideas')
      .select('*')
      .eq('session_id', sessionData.id)
      .order('created_at', { ascending: true })

    const ideaIds = (ideasData ?? []).map((i: Idea) => i.id)

    const [{ data: participantsData }, { data: votesData }] = await Promise.all([
      supabase.from('participants').select('*').eq('session_id', sessionData.id),
      ideaIds.length > 0
        ? supabase.from('votes').select('*').in('idea_id', ideaIds)
        : Promise.resolve({ data: [] }),
    ])

    setParticipants(participantsData ?? [])
    setIdeas(ideasData ?? [])
    setVotes(votesData ?? [])
    setLoading(false)
  }, [code])

  useEffect(() => {
    const stored = getStoredParticipant(code)
    setStoredParticipant(stored)
    if (!stored) setShowJoinModal(true)
    loadSession()
  }, [code, loadSession])

  useEffect(() => {
    if (!session) return

    const channel = supabase
      .channel(`session:${session.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${session.id}`,
        },
        payload => {
          if (payload.new) setSession(payload.new as Session)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'participants',
          filter: `session_id=eq.${session.id}`,
        },
        payload => setParticipants(prev => [...prev, payload.new as Participant])
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ideas',
          filter: `session_id=eq.${session.id}`,
        },
        payload => setIdeas(prev => [...prev, payload.new as Idea])
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'votes',
        },
        payload => {
          const newVote = payload.new as Vote
          // Filter client-side: only add if this vote belongs to one of our ideas
          setIdeas(currentIdeas => {
            const ideaIds = new Set(currentIdeas.map(i => i.id))
            if (ideaIds.has(newVote.idea_id)) {
              setVotes(prev => {
                // Avoid duplicates
                if (prev.some(v => v.id === newVote.id)) return prev
                return [...prev, newVote]
              })
            }
            return currentIdeas
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session?.id])

  const ideasWithVotes: IdeaWithVotes[] = ideas.map(idea => ({
    ...idea,
    vote_count: votes.filter(v => v.idea_id === idea.id).length,
    has_voted: votes.some(
      v => v.idea_id === idea.id && v.participant_id === storedParticipant?.participantId
    ),
  }))

  function handleJoined(participant: { participantId: string; nickname: string; isHost: boolean }) {
    setStoredParticipant(participant)
    setShowJoinModal(false)
    loadSession()
  }

  if (loading) return <LoadingScreen />
  if (notFound) return <NotFoundScreen code={code} />

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="orb w-64 h-64 bg-indigo-600/20 -top-10 -right-10" />
      <div className="orb w-48 h-48 bg-purple-600/15 bottom-20 -left-10" />

      {showJoinModal && session && (
        <JoinModal session={session} onJoined={handleJoined} />
      )}

      {!showJoinModal && session && storedParticipant && (
        <>
          {session.phase === 'brainstorming' && (
            <BrainstormPhase
              session={session}
              ideas={ideas}
              participants={participants}
              storedParticipant={storedParticipant}
            />
          )}
          {session.phase === 'voting' && (
            <VotingPhase
              session={session}
              ideasWithVotes={ideasWithVotes}
              participants={participants}
              storedParticipant={storedParticipant}
            />
          )}
          {session.phase === 'results' && (
            <ResultsPhase
              session={session}
              ideasWithVotes={ideasWithVotes}
              participants={participants}
            />
          )}
        </>
      )}
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="text-5xl animate-float">🍽️</div>
      <p className="text-white/40 animate-pulse-soft">Loading session…</p>
    </div>
  )
}

function NotFoundScreen({ code }: { code: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-4">
      <div className="text-5xl">😕</div>
      <h2 className="text-2xl font-bold">Session not found</h2>
      <p className="text-white/50">
        No session with code <strong>{code}</strong> exists or it has expired.
      </p>
      <a href="/" className="btn-primary mt-4">
        Back to Home
      </a>
    </div>
  )
}
