import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';
  const position = searchParams.get('position') || '';
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const entries = await sql`
      SELECT 
        pe.id,
        pe.status,
        pe.entry_date,
        pe.commit_date,
        pe.transfer_year,
        p.id as player_id,
        p.name as player_name,
        p.position,
        ft.name as from_team,
        ft.logo_url as from_team_logo,
        tt.name as to_team,
        tt.logo_url as to_team_logo,
        n.valuation_usd as nil_value
      FROM portal_entries pe
      JOIN players p ON p.id = pe.player_id
      LEFT JOIN teams ft ON ft.id = pe.from_team_id
      LEFT JOIN teams tt ON tt.id = pe.to_team_id
      LEFT JOIN nil_valuations n ON n.player_id = p.id
      WHERE 
        p.name NOT LIKE '%undefined%'
        AND (${status} = '' OR pe.status = ${status})
        AND (${position} = '' OR p.position = ${position})
      ORDER BY pe.entry_date DESC, n.valuation_usd DESC NULLS LAST
      LIMIT ${limit}
    `;

    const [stats] = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'entered') as available,
        COUNT(*) FILTER (WHERE status = 'committed') as committed,
        COUNT(*) FILTER (WHERE status = 'withdrawn') as withdrawn
      FROM portal_entries
    `;

    return NextResponse.json({
      entries,
      stats: {
        total: parseInt(stats.total),
        available: parseInt(stats.available),
        committed: parseInt(stats.committed),
        withdrawn: parseInt(stats.withdrawn),
      },
    });
  } catch (error) {
    console.error('Error fetching portal entries:', error);
    return NextResponse.json({ error: 'Failed to fetch portal entries' }, { status: 500 });
  }
}
