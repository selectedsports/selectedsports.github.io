-- ==============================================================================
-- Selected Sports - Live Cricket Scoring Subsystem Database Schema
-- Adheres to Software Requirements Specification v1.0 Section 5 (DM-9 to DM-18)
-- ==============================================================================

-- 1. match_scoring_config (DM-9)
CREATE TABLE IF NOT EXISTS match_scoring_config (
  match_id UUID PRIMARY KEY REFERENCES matches(id) ON DELETE CASCADE,
  format TEXT NOT NULL DEFAULT 'T20',
  overs_per_innings INTEGER NOT NULL DEFAULT 20,
  balls_per_over INTEGER NOT NULL DEFAULT 6 CHECK (balls_per_over BETWEEN 4 AND 8),
  players_per_side INTEGER NOT NULL DEFAULT 11 CHECK (players_per_side BETWEEN 5 AND 11),
  max_overs_per_bowler INTEGER NOT NULL DEFAULT 4,
  free_hit_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  wide_penalty INTEGER NOT NULL DEFAULT 1,
  noball_penalty INTEGER NOT NULL DEFAULT 1,
  byes_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  last_man_stands BOOLEAN NOT NULL DEFAULT FALSE,
  toss_winner_team_id UUID REFERENCES teams(id),
  toss_decision TEXT CHECK (toss_decision IN ('bat', 'bowl')),
  public_link_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  public_token TEXT UNIQUE NOT NULL,
  scoring_status TEXT NOT NULL DEFAULT 'pending' CHECK (scoring_status IN ('pending', 'live', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. match_squad (DM-10)
CREATE TABLE IF NOT EXISTS match_squad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id),
  player_id UUID REFERENCES players(id),
  display_name TEXT NOT NULL,
  is_linked BOOLEAN NOT NULL DEFAULT TRUE,
  batting_order INTEGER DEFAULT 999,
  is_captain BOOLEAN NOT NULL DEFAULT FALSE,
  is_keeper BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_match_squad_player UNIQUE (match_id, player_id)
);

-- 3. innings (DM-11)
CREATE TABLE IF NOT EXISTS innings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  innings_number INTEGER NOT NULL,
  batting_team_id UUID NOT NULL REFERENCES teams(id),
  bowling_team_id UUID NOT NULL REFERENCES teams(id),
  target INTEGER,
  overs_limit NUMERIC NOT NULL DEFAULT 20,
  total_runs INTEGER NOT NULL DEFAULT 0,
  total_wickets INTEGER NOT NULL DEFAULT 0,
  legal_balls INTEGER NOT NULL DEFAULT 0,
  extras_wide INTEGER NOT NULL DEFAULT 0,
  extras_noball INTEGER NOT NULL DEFAULT 0,
  extras_bye INTEGER NOT NULL DEFAULT 0,
  extras_legbye INTEGER NOT NULL DEFAULT 0,
  extras_penalty INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'awaiting_batter', 'awaiting_bowler', 'complete')),
  is_revised BOOLEAN NOT NULL DEFAULT FALSE,
  ended_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_innings_match_number UNIQUE (match_id, innings_number)
);

-- 4. deliveries (DM-12) - Immutable system of record (AD-2, C-4)
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_uuid TEXT UNIQUE NOT NULL,
  innings_id UUID NOT NULL REFERENCES innings(id) ON DELETE CASCADE,
  sequence_no INTEGER NOT NULL,
  over_no INTEGER NOT NULL,
  ball_in_over INTEGER NOT NULL,
  is_legal BOOLEAN NOT NULL DEFAULT TRUE,
  striker_id UUID NOT NULL REFERENCES match_squad(id),
  non_striker_id UUID NOT NULL REFERENCES match_squad(id),
  bowler_id UUID NOT NULL REFERENCES match_squad(id),
  runs_off_bat INTEGER NOT NULL DEFAULT 0 CHECK (runs_off_bat BETWEEN 0 AND 8),
  extra_type TEXT NOT NULL DEFAULT 'none',
  extra_runs INTEGER NOT NULL DEFAULT 0,
  is_wicket BOOLEAN NOT NULL DEFAULT FALSE,
  dismissal_type TEXT,
  dismissed_squad_id UUID REFERENCES match_squad(id),
  fielder_squad_id UUID REFERENCES match_squad(id),
  is_free_hit BOOLEAN NOT NULL DEFAULT FALSE,
  superseded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES players(id),
  CONSTRAINT uq_delivery_sequence UNIQUE (innings_id, sequence_no)
);

-- 5. match_results (DM-13)
CREATE TABLE IF NOT EXISTS match_results (
  match_id UUID PRIMARY KEY REFERENCES matches(id) ON DELETE CASCADE,
  winning_team_id UUID REFERENCES teams(id),
  result_type TEXT NOT NULL CHECK (result_type IN ('win_by_runs', 'win_by_wickets', 'tie', 'no_result', 'abandoned')),
  margin_value INTEGER,
  margin_unit TEXT,
  balls_remaining INTEGER,
  result_text TEXT NOT NULL,
  mom_squad_id UUID REFERENCES match_squad(id),
  committed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. player_match_stats (DM-14)
CREATE TABLE IF NOT EXISTS player_match_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id),
  squad_id UUID NOT NULL REFERENCES match_squad(id),
  runs INTEGER NOT NULL DEFAULT 0,
  balls_faced INTEGER NOT NULL DEFAULT 0,
  fours INTEGER NOT NULL DEFAULT 0,
  sixes INTEGER NOT NULL DEFAULT 0,
  is_out BOOLEAN NOT NULL DEFAULT FALSE,
  dismissal_type TEXT,
  overs_bowled NUMERIC NOT NULL DEFAULT 0,
  balls_bowled INTEGER NOT NULL DEFAULT 0,
  maidens INTEGER NOT NULL DEFAULT 0,
  runs_conceded INTEGER NOT NULL DEFAULT 0,
  wickets INTEGER NOT NULL DEFAULT 0,
  catches INTEGER NOT NULL DEFAULT 0,
  run_outs INTEGER NOT NULL DEFAULT 0,
  stumpings INTEGER NOT NULL DEFAULT 0,
  is_mom BOOLEAN NOT NULL DEFAULT FALSE,
  impact_score NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_player_match UNIQUE (match_id, player_id)
);

-- 7. player_career_stats (DM-15) - Materialized Cache (AD-4)
CREATE TABLE IF NOT EXISTS player_career_stats (
  player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
  matches INTEGER NOT NULL DEFAULT 0,
  innings_batted INTEGER NOT NULL DEFAULT 0,
  runs INTEGER NOT NULL DEFAULT 0,
  highest_score INTEGER NOT NULL DEFAULT 0,
  not_outs INTEGER NOT NULL DEFAULT 0,
  fours INTEGER NOT NULL DEFAULT 0,
  sixes INTEGER NOT NULL DEFAULT 0,
  fifties INTEGER NOT NULL DEFAULT 0,
  hundreds INTEGER NOT NULL DEFAULT 0,
  innings_bowled INTEGER NOT NULL DEFAULT 0,
  balls_bowled INTEGER NOT NULL DEFAULT 0,
  maidens INTEGER NOT NULL DEFAULT 0,
  runs_conceded INTEGER NOT NULL DEFAULT 0,
  wickets INTEGER NOT NULL DEFAULT 0,
  best_figures TEXT,
  three_fers INTEGER NOT NULL DEFAULT 0,
  five_fers INTEGER NOT NULL DEFAULT 0,
  catches INTEGER NOT NULL DEFAULT 0,
  run_outs INTEGER NOT NULL DEFAULT 0,
  stumpings INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  mom_count INTEGER NOT NULL DEFAULT 0,
  last_rebuilt_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. match_scorers (DM-16)
CREATE TABLE IF NOT EXISTS match_scorers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES players(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  CONSTRAINT uq_match_scorer UNIQUE (match_id, player_id)
);

-- 9. innings_write_lock (DM-17)
CREATE TABLE IF NOT EXISTS innings_write_lock (
  innings_id UUID PRIMARY KEY REFERENCES innings(id) ON DELETE CASCADE,
  holder_player_id UUID NOT NULL REFERENCES players(id),
  device_id TEXT NOT NULL,
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  last_heartbeat_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. scoring_audit (DM-18)
CREATE TABLE IF NOT EXISTS scoring_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  actor_player_id UUID REFERENCES players(id),
  action TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
