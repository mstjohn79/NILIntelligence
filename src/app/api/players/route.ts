import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const position = searchParams.get('position') || '';
  const team = searchParams.get('team') || '';
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
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
        CASE WHEN pe.id IS NOT NULL THEN pe.status ELSE NULL END as portal_status
      FROM players p
      LEFT JOIN teams t ON t.id = p.current_team_id
      LEFT JOIN nil_valuations n ON n.player_id = p.id
      LEFT JOIN portal_entries pe ON pe.player_id = p.id
      WHERE 
        p.name NOT LIKE '%undefined%'
        AND (${search} = '' OR p.name ILIKE ${'%' + search + '%'})
        AND (${position} = '' OR p.position = ${position})
        AND (${team} = '' OR t.name ILIKE ${'%' + team + '%'})
      ORDER BY n.valuation_usd DESC NULLS LAST
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const [countResult] = await sql`
      SELECT COUNT(*) as total
      FROM players p
      LEFT JOIN teams t ON t.id = p.current_team_id
      WHERE 
        p.name NOT LIKE '%undefined%'
        AND (${search} = '' OR p.name ILIKE ${'%' + search + '%'})
        AND (${position} = '' OR p.position = ${position})
        AND (${team} = '' OR t.name ILIKE ${'%' + team + '%'})
    `;

    return NextResponse.json({
      players,
      total: parseInt(countResult.total),
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
  }
}
