export type Phase = 'brainstorming' | 'voting' | 'results'

export interface Session {
  id: string
  code: string
  host_id: string
  phase: Phase
  created_at: string
  expires_at: string
}

export interface Participant {
  id: string
  session_id: string
  nickname: string
  is_host: boolean
  created_at: string
}

export interface Idea {
  id: string
  session_id: string
  participant_id: string
  text: string
  emoji: string | null
  created_at: string
}

export interface Vote {
  id: string
  idea_id: string
  participant_id: string
  created_at: string
}

export interface IdeaWithVotes extends Idea {
  vote_count: number
  has_voted: boolean
}
