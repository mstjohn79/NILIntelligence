import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Filters
  const position = searchParams.get('position') || '';
  const minBudget = parseInt(searchParams.get('minBudget') || '0');
  const maxBudget = parseInt(searchParams.get('maxBudget') || '99999999');
  const portalOnly = searchParams.get('portalOnly') === 'true';
  const team = searchParams.get('team') || '';
  
  // Stat filters
  const minSacks = parseFloat(searchParams.get('minSacks') || '0');
  const minTackles = parseInt(searchParams.get('minTackles') || '0');
  const minPassYards = parseInt(searchParams.get('minPassYards') || '0');
  const minRushYards = parseInt(searchParams.get('minRushYards') || '0');
  const minRecYards = parseInt(searchParams.get('minRecYards') || '0');
  const minTDs = parseInt(searchParams.get('minTDs') || '0');
  
  // Sorting
  const sortBy = searchParams.get('sortBy') || 'nil_value';
  const sortDir = searchParams.get('sortDir') || 'desc';
  
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    // Build dynamic query based on position type
    const players = await sql`
      SELECT 
        p.id,
        p.name,
        p.position,
        p.height_inches,
        p.weight_lbs,
        p.class_year,
        t.name as team,
        t.conference,
        t.logo_url as team_logo,
        n.valuation_usd as nil_value,
        n.instagram_followers,
        n.twitter_followers,
        n.tiktok_followers,
        pe.status as portal_status,
        pe.entry_date as portal_entry_date,
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
        s.pancakes,
        -- Computed fields
        COALESCE(s.pass_tds, 0) + COALESCE(s.rush_tds, 0) + COALESCE(s.rec_tds, 0) as total_tds
      FROM players p
      LEFT JOIN teams t ON t.id = p.current_team_id
      LEFT JOIN nil_valuations n ON n.player_id = p.id
      LEFT JOIN portal_entries pe ON pe.player_id = p.id
      LEFT JOIN player_stats s ON s.player_id = p.id AND s.season = 2025
      WHERE 
        (${position} = '' OR p.position = ${position})
        AND n.valuation_usd >= ${minBudget}
        AND n.valuation_usd <= ${maxBudget}
        AND (${!portalOnly} OR pe.status = 'entered')
        AND (${team} = '' OR t.name ILIKE ${'%' + team + '%'})
        AND (${minSacks} = 0 OR COALESCE(s.sacks, 0) >= ${minSacks})
        AND (${minTackles} = 0 OR COALESCE(s.tackles, 0) >= ${minTackles})
        AND (${minPassYards} = 0 OR COALESCE(s.pass_yards, 0) >= ${minPassYards})
        AND (${minRushYards} = 0 OR COALESCE(s.rush_yards, 0) >= ${minRushYards})
        AND (${minRecYards} = 0 OR COALESCE(s.rec_yards, 0) >= ${minRecYards})
        AND (${minTDs} = 0 OR (COALESCE(s.pass_tds, 0) + COALESCE(s.rush_tds, 0) + COALESCE(s.rec_tds, 0)) >= ${minTDs})
      ORDER BY 
        CASE WHEN ${sortBy} = 'nil_value' THEN n.valuation_usd END DESC NULLS LAST,
        CASE WHEN ${sortBy} = 'sacks' THEN s.sacks END DESC NULLS LAST,
        CASE WHEN ${sortBy} = 'tackles' THEN s.tackles END DESC NULLS LAST,
        CASE WHEN ${sortBy} = 'pass_yards' THEN s.pass_yards END DESC NULLS LAST,
        CASE WHEN ${sortBy} = 'rush_yards' THEN s.rush_yards END DESC NULLS LAST,
        CASE WHEN ${sortBy} = 'rec_yards' THEN s.rec_yards END DESC NULLS LAST,
        n.valuation_usd DESC NULLS LAST
      LIMIT ${limit}
    `;

    // Get position counts for filters
    const positionCounts = await sql`
      SELECT p.position, COUNT(*) as count
      FROM players p
      LEFT JOIN nil_valuations n ON n.player_id = p.id
      LEFT JOIN portal_entries pe ON pe.player_id = p.id
      WHERE 
        n.valuation_usd >= ${minBudget}
        AND n.valuation_usd <= ${maxBudget}
        AND (${!portalOnly} OR pe.status = 'entered')
      GROUP BY p.position
      ORDER BY count DESC
    `;

    // Get budget ranges
    const budgetStats = await sql`
      SELECT 
        MIN(valuation_usd) as min_nil,
        MAX(valuation_usd) as max_nil,
        AVG(valuation_usd)::int as avg_nil
      FROM nil_valuations
    `;

    return NextResponse.json({
      players,
      filters: {
        positions: positionCounts,
        budgetRange: budgetStats[0],
      },
      total: players.length,
    });
  } catch (error) {
    console.error('Error searching players:', error);
    return NextResponse.json({ error: 'Failed to search players' }, { status: 500 });
  }
}
