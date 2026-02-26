import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const [player] = await sql`
      SELECT 
        p.id,
        p.name,
        p.position,
        p.height_inches,
        p.weight_lbs,
        p.class_year,
        p.hometown_city,
        p.hometown_state,
        t.name as team,
        t.conference,
        t.logo_url as team_logo,
        t.primary_color as team_color,
        n.valuation_usd as nil_value,
        n.instagram_followers,
        n.twitter_followers,
        n.tiktok_followers,
        n.valuation_date,
        n.source as nil_source,
        pe.status as portal_status,
        pe.entry_date as portal_entry_date,
        pe.transfer_year,
        ft.name as from_team,
        ft.logo_url as from_team_logo,
        -- Stats
        s.games_played,
        s.pass_yards,
        s.pass_tds,
        s.interceptions,
        s.completion_pct,
        s.qb_rating,
        s.rush_yards,
        s.rush_tds,
        s.yards_per_carry,
        s.receptions,
        s.rec_yards,
        s.rec_tds,
        s.yards_per_rec,
        s.tackles,
        s.solo_tackles,
        s.sacks,
        s.tfl,
        s.qb_hurries,
        s.forced_fumbles,
        s.pass_deflections,
        s.games_started,
        s.sacks_allowed,
        s.pancakes,
        s.penalties,
        -- Recruiting (from new table)
        r.stars as star_rating,
        r.rating as composite_rating,
        r.national_rank,
        r.position_rank,
        r.recruit_year as recruiting_class_year,
        r.high_school,
        r.city as recruit_city,
        r.state as recruit_state
      FROM players p
      LEFT JOIN teams t ON t.id = p.current_team_id
      LEFT JOIN nil_valuations n ON n.player_id = p.id
      LEFT JOIN portal_entries pe ON pe.player_id = p.id
      LEFT JOIN teams ft ON ft.id = pe.from_team_id
      LEFT JOIN player_stats s ON s.player_id = p.id AND s.season = 2025
      LEFT JOIN player_recruiting r ON r.player_id = p.id
      WHERE p.id = ${id}
    `;

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Get historical season stats (multiple years)
    const seasonHistory = await sql`
      SELECT 
        season,
        team,
        games,
        pass_completions,
        pass_attempts,
        pass_yards,
        pass_tds,
        interceptions,
        rush_attempts,
        rush_yards,
        rush_tds,
        receptions,
        rec_yards,
        rec_tds,
        tackles,
        solo_tackles,
        sacks,
        tfl,
        qb_hurries,
        interceptions_def,
        pass_deflections,
        forced_fumbles
      FROM player_season_history
      WHERE player_id = ${id}
      ORDER BY season DESC
    `;

    // Get game logs (2024 season)
    const gameLogs = await sql`
      SELECT 
        opponent,
        home_away,
        pass_completions,
        pass_attempts,
        pass_yards,
        pass_tds,
        interceptions,
        rush_attempts,
        rush_yards,
        rush_tds,
        receptions,
        rec_yards,
        rec_tds,
        tackles,
        sacks,
        tfl
      FROM player_game_logs
      WHERE player_id = ${id}
      ORDER BY cfbd_game_id
    `;

    // Get similar players (same position, similar NIL value)
    const similarPlayers = await sql`
      SELECT 
        p.id,
        p.name,
        p.position,
        t.name as team,
        t.logo_url as team_logo,
        n.valuation_usd as nil_value,
        pe.status as portal_status
      FROM players p
      LEFT JOIN teams t ON t.id = p.current_team_id
      LEFT JOIN nil_valuations n ON n.player_id = p.id
      LEFT JOIN portal_entries pe ON pe.player_id = p.id
      WHERE p.position = ${player.position}
        AND p.id != ${id}
        AND n.valuation_usd IS NOT NULL
      ORDER BY ABS(n.valuation_usd - ${player.nil_value || 0})
      LIMIT 5
    `;

    return NextResponse.json({
      player,
      seasonHistory,
      gameLogs,
      similarPlayers,
    });
  } catch (error) {
    console.error('Error fetching player:', error);
    return NextResponse.json({ error: 'Failed to fetch player' }, { status: 500 });
  }
}
