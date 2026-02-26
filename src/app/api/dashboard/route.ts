import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Get total counts
    const [playerCount] = await sql`SELECT COUNT(*) as count FROM players`;
    const [portalCount] = await sql`SELECT COUNT(*) as count FROM portal_entries`;
    const [avgNil] = await sql`SELECT AVG(valuation_usd)::int as avg FROM nil_valuations`;
    const [topNil] = await sql`SELECT MAX(valuation_usd) as max FROM nil_valuations`;

    // Get recent portal activity
    const recentPortal = await sql`
      SELECT 
        p.name as player_name,
        p.position,
        ft.name as from_team,
        tt.name as to_team,
        pe.status,
        n.valuation_usd as nil_value
      FROM portal_entries pe
      JOIN players p ON p.id = pe.player_id
      LEFT JOIN teams ft ON ft.id = pe.from_team_id
      LEFT JOIN teams tt ON tt.id = pe.to_team_id
      LEFT JOIN nil_valuations n ON n.player_id = p.id
      WHERE p.name NOT LIKE '%undefined%'
      ORDER BY pe.entry_date DESC
      LIMIT 5
    `;

    // Get top NIL players
    const topPlayers = await sql`
      SELECT 
        p.name,
        p.position,
        t.name as team,
        n.valuation_usd
      FROM nil_valuations n
      JOIN players p ON p.id = n.player_id
      LEFT JOIN teams t ON t.id = p.current_team_id
      WHERE p.name NOT LIKE '%undefined%'
      ORDER BY n.valuation_usd DESC
      LIMIT 5
    `;

    return NextResponse.json({
      stats: {
        totalPlayers: parseInt(playerCount.count),
        portalEntries: parseInt(portalCount.count),
        avgNilValue: avgNil.avg || 0,
        topNilValue: topNil.max || 0,
      },
      recentPortal,
      topPlayers,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
