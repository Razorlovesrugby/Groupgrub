-- GroupGrub Schema
-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  host_id UUID NOT NULL,
  phase TEXT NOT NULL DEFAULT 'brainstorming' CHECK (phase IN ('brainstorming', 'voting', 'results')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Participants table
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  is_host BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  emoji TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(idea_id, participant_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_sessions_code ON sessions(code);
CREATE INDEX IF NOT EXISTS idx_participants_session_id ON participants(session_id);
CREATE INDEX IF NOT EXISTS idx_ideas_session_id ON ideas(session_id);
CREATE INDEX IF NOT EXISTS idx_votes_idea_id ON votes(idea_id);
CREATE INDEX IF NOT EXISTS idx_votes_participant_id ON votes(participant_id);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Sessions RLS Policies
-- Anyone can read sessions (needed to join by code)
CREATE POLICY "sessions_select_all" ON sessions
  FOR SELECT USING (true);

-- Anyone can insert a new session
CREATE POLICY "sessions_insert_all" ON sessions
  FOR INSERT WITH CHECK (true);

-- Anyone can update a session (host controls phase — enforced in app logic)
CREATE POLICY "sessions_update_all" ON sessions
  FOR UPDATE USING (true);

-- Participants RLS Policies
-- Anyone can read participants in any session
CREATE POLICY "participants_select_all" ON participants
  FOR SELECT USING (true);

-- Anyone can insert a participant
CREATE POLICY "participants_insert_all" ON participants
  FOR INSERT WITH CHECK (true);

-- Ideas RLS Policies
-- Anyone can read ideas
CREATE POLICY "ideas_select_all" ON ideas
  FOR SELECT USING (true);

-- Anyone can insert ideas
CREATE POLICY "ideas_insert_all" ON ideas
  FOR INSERT WITH CHECK (true);

-- Votes RLS Policies
-- Anyone can read votes
CREATE POLICY "votes_select_all" ON votes
  FOR SELECT USING (true);

-- Anyone can insert votes
CREATE POLICY "votes_insert_all" ON votes
  FOR INSERT WITH CHECK (true);

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
ALTER PUBLICATION supabase_realtime ADD TABLE ideas;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
