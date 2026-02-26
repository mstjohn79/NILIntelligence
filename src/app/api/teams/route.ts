import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const conference = searchParams.get('conference') || '';

  try {
    const teams = await sql`
      SELECT 
        t.id,
        t.name,
        t.mascot,
        t.abbreviation,
        t.conference,
        t.logo_url,
        t.primary_color,
        t.secondary_color,
        COUNT(DISTINCT p.id) as roster_size,
        COALESCE(AVG(n.valuation_usd), 0)::int as avg_nil
      FROM teams t
      LEFT JOIN players p ON p.current_team_id = t.id
      LEFT JOIN nil_valuations n ON n.player_id = p.id
      WHERE 
        (${search} = '' OR t.name ILIKE ${'%' + search + '%'})
        AND (${conference} = '' OR t.conference = ${conference})
      GROUP BY t.id
      ORDER BY avg_nil DESC
    `;

    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}
