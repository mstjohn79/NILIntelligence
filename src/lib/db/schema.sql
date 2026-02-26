-- NIL Intelligence Database Schema
-- For Neon Postgres

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cfbd_id INTEGER UNIQUE,
    name VARCHAR(255) NOT NULL,
    mascot VARCHAR(100),
    abbreviation VARCHAR(10),
    conference VARCHAR(100),
    division VARCHAR(50),
    logo_url TEXT,
    primary_color VARCHAR(7),
    secondary_color VARCHAR(7),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cfbd_id INTEGER UNIQUE,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(10),
    height_inches INTEGER,
    weight_lbs INTEGER,
    hometown_city VARCHAR(100),
    hometown_state VARCHAR(2),
    high_school VARCHAR(255),
    current_team_id UUID REFERENCES teams(id),
    class_year VARCHAR(10),
    eligibility_remaining INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for player search
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);
CREATE INDEX IF NOT EXISTS idx_players_team ON players(current_team_id);

-- Recruiting profiles
CREATE TABLE IF NOT EXISTS recruiting_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    composite_rating DECIMAL(6,4),
    star_rating INTEGER,
    national_rank INTEGER,
    position_rank INTEGER,
    state_rank INTEGER,
    recruiting_class_year INTEGER,
    source VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recruiting_player ON recruiting_profiles(player_id);
CREATE INDEX IF NOT EXISTS idx_recruiting_rating ON recruiting_profiles(composite_rating DESC);

-- Player season stats
CREATE TABLE IF NOT EXISTS player_season_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    season INTEGER NOT NULL,
    team_id UUID REFERENCES teams(id),
    games_played INTEGER,
    stats JSONB,
    ppa DECIMAL(6,3),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stats_player ON player_season_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_stats_season ON player_season_stats(season);

-- NIL valuations
CREATE TABLE IF NOT EXISTS nil_valuations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    valuation_usd INTEGER,
    instagram_followers INTEGER,
    twitter_followers INTEGER,
    tiktok_followers INTEGER,
    on3_nil_rank INTEGER,
    valuation_date DATE,
    source VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nil_player ON nil_valuations(player_id);
CREATE INDEX IF NOT EXISTS idx_nil_value ON nil_valuations(valuation_usd DESC);

-- Transfer portal entries
CREATE TABLE IF NOT EXISTS portal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    from_team_id UUID REFERENCES teams(id),
    to_team_id UUID REFERENCES teams(id),
    entry_date DATE NOT NULL,
    commit_date DATE,
    withdrawal_date DATE,
    status VARCHAR(20) DEFAULT 'entered',
    transfer_year INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_player ON portal_entries(player_id);
CREATE INDEX IF NOT EXISTS idx_portal_status ON portal_entries(status);
CREATE INDEX IF NOT EXISTS idx_portal_date ON portal_entries(entry_date DESC);

-- Full-text search index for players
CREATE INDEX IF NOT EXISTS idx_players_search ON players USING gin(to_tsvector('english', name));
