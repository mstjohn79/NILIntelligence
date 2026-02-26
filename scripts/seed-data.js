// ETL Script: Seed database with CFBD data
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_H3XumWpzdL6v@ep-misty-firefly-aimleo5o-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require';
const CFBD_API_KEY = process.env.CFBD_API_KEY || 'I3PJO4m98j2M/uZXFHm1NcP/ZcDjtyU6SwVF9ouGp+gplGxdBjCR/xCWboU+vwZp';
const CFBD_BASE_URL = 'https://api.collegefootballdata.com';

const sql = neon(DATABASE_URL);

async function cfbdFetch(endpoint, params = {}) {
  const url = new URL(`${CFBD_BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.append(key, String(value));
  });

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${CFBD_API_KEY}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`CFBD API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function seedTeams() {
  console.log('\n📋 Fetching FBS teams...');
  const teams = await cfbdFetch('/teams', { conference: undefined });
  
  // Filter to FBS teams only
  const fbsTeams = teams.filter(t => t.classification === 'fbs');
  console.log(`   Found ${fbsTeams.length} FBS teams`);

  for (const team of fbsTeams) {
    await sql`
      INSERT INTO teams (cfbd_id, name, mascot, abbreviation, conference, division, logo_url, primary_color, secondary_color)
      VALUES (
        ${team.id},
        ${team.school},
        ${team.mascot},
        ${team.abbreviation},
        ${team.conference},
        ${team.division || null},
        ${team.logos?.[0] || null},
        ${team.color || null},
        ${team.alt_color || null}
      )
      ON CONFLICT (cfbd_id) DO UPDATE SET
        name = EXCLUDED.name,
        mascot = EXCLUDED.mascot,
        conference = EXCLUDED.conference,
        logo_url = EXCLUDED.logo_url,
        updated_at = NOW()
    `;
  }
  console.log(`   ✅ Inserted/updated ${fbsTeams.length} teams`);
  return fbsTeams;
}

async function seedRosters(teams) {
  console.log('\n👥 Fetching rosters for each team...');
  let totalPlayers = 0;

  for (const team of teams) {
    try {
      const roster = await cfbdFetch('/roster', { team: team.school, year: 2025 });
      
      // Get team ID from our database
      const [dbTeam] = await sql`SELECT id FROM teams WHERE cfbd_id = ${team.id}`;
      
      if (!dbTeam) continue;

      for (const player of roster) {
        await sql`
          INSERT INTO players (cfbd_id, name, position, height_inches, weight_lbs, hometown_city, hometown_state, current_team_id, class_year)
          VALUES (
            ${player.id},
            ${player.firstName + ' ' + player.lastName},
            ${player.position},
            ${player.height || null},
            ${player.weight || null},
            ${player.homeCity || null},
            ${player.homeState || null},
            ${dbTeam.id},
            ${player.year ? String(player.year) : null}
          )
          ON CONFLICT (cfbd_id) DO UPDATE SET
            name = EXCLUDED.name,
            position = EXCLUDED.position,
            weight_lbs = EXCLUDED.weight_lbs,
            current_team_id = EXCLUDED.current_team_id,
            class_year = EXCLUDED.class_year,
            updated_at = NOW()
        `;
        totalPlayers++;
      }
      
      process.stdout.write(`   ${team.school}: ${roster.length} players\r`);
      
      // Rate limiting - CFBD free tier is limited
      await new Promise(r => setTimeout(r, 100));
    } catch (err) {
      console.log(`   ⚠️  Error fetching ${team.school}: ${err.message}`);
    }
  }
  
  console.log(`\n   ✅ Inserted/updated ${totalPlayers} players`);
}

async function seedRecruits() {
  console.log('\n⭐ Fetching recruiting data (2023-2025)...');
  let totalRecruits = 0;

  for (const year of [2023, 2024, 2025]) {
    try {
      const recruits = await cfbdFetch('/recruiting/players', { year });
      console.log(`   ${year}: ${recruits.length} recruits`);

      for (const recruit of recruits) {
        // Find player by name (rough match)
        const [player] = await sql`
          SELECT id FROM players 
          WHERE name ILIKE ${recruit.name}
          LIMIT 1
        `;

        if (player) {
          await sql`
            INSERT INTO recruiting_profiles (player_id, composite_rating, star_rating, national_rank, position_rank, state_rank, recruiting_class_year, source)
            VALUES (
              ${player.id},
              ${recruit.rating || null},
              ${recruit.stars || null},
              ${recruit.ranking || null},
              ${recruit.positionRank || null},
              ${recruit.stateRank || null},
              ${year},
              '247Sports'
            )
            ON CONFLICT DO NOTHING
          `;
          totalRecruits++;
        }
      }
      
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.log(`   ⚠️  Error fetching ${year} recruits: ${err.message}`);
    }
  }
  
  console.log(`   ✅ Linked ${totalRecruits} recruiting profiles`);
}

async function seedTransfers() {
  console.log('\n🔄 Fetching transfer portal entries (2024-2025)...');
  let totalTransfers = 0;

  for (const year of [2024, 2025]) {
    try {
      const transfers = await cfbdFetch('/player/transfer', { year });
      console.log(`   ${year}: ${transfers.length} transfers`);

      for (const transfer of transfers) {
        // Find player
        const playerName = `${transfer.firstName} ${transfer.lastName}`;
        const [player] = await sql`
          SELECT id FROM players 
          WHERE name ILIKE ${playerName}
          LIMIT 1
        `;

        if (player) {
          // Get team IDs
          const [fromTeam] = transfer.origin ? 
            await sql`SELECT id FROM teams WHERE name ILIKE ${transfer.origin} LIMIT 1` : [null];
          const [toTeam] = transfer.destination ? 
            await sql`SELECT id FROM teams WHERE name ILIKE ${transfer.destination} LIMIT 1` : [null];

          await sql`
            INSERT INTO portal_entries (player_id, from_team_id, to_team_id, entry_date, status, transfer_year)
            VALUES (
              ${player.id},
              ${fromTeam?.id || null},
              ${toTeam?.id || null},
              ${transfer.transferDate || new Date().toISOString().split('T')[0]},
              ${toTeam ? 'committed' : 'entered'},
              ${year}
            )
            ON CONFLICT DO NOTHING
          `;
          totalTransfers++;
        }
      }
      
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.log(`   ⚠️  Error fetching ${year} transfers: ${err.message}`);
    }
  }
  
  console.log(`   ✅ Added ${totalTransfers} portal entries`);
}

async function generateNILValuations() {
  console.log('\n💰 Generating NIL valuations...');
  
  // Get all players with recruiting data
  const players = await sql`
    SELECT 
      p.id,
      p.position,
      rp.star_rating,
      rp.composite_rating,
      t.conference
    FROM players p
    LEFT JOIN recruiting_profiles rp ON rp.player_id = p.id
    LEFT JOIN teams t ON t.id = p.current_team_id
    WHERE rp.star_rating IS NOT NULL
  `;

  const positionPremiums = {
    QB: 2.5, RB: 1.4, WR: 1.3, TE: 1.1, OL: 0.9,
    DL: 1.0, LB: 1.0, DB: 1.1, CB: 1.1, S: 1.0,
    K: 0.6, P: 0.5, LS: 0.4
  };

  const confMultipliers = {
    SEC: 1.4, 'Big Ten': 1.35, 'Big 12': 1.2, ACC: 1.15,
    'Pac-12': 1.1, 'Mountain West': 0.85, 'American Athletic': 0.8
  };

  let count = 0;
  for (const player of players) {
    const starValues = { 5: 500000, 4: 150000, 3: 50000, 2: 15000 };
    let baseValue = starValues[player.star_rating] || 25000;
    
    const posMult = positionPremiums[player.position] || 1.0;
    const confMult = confMultipliers[player.conference] || 0.9;
    
    // Add some randomness for realism
    const variance = 0.7 + Math.random() * 0.6;
    const nilValue = Math.round((baseValue * posMult * confMult * variance) / 1000) * 1000;

    // Random social followers
    const insta = Math.floor(Math.random() * 50000) + 1000;
    const twitter = Math.floor(Math.random() * 20000) + 500;
    const tiktok = Math.floor(Math.random() * 30000) + 100;

    await sql`
      INSERT INTO nil_valuations (player_id, valuation_usd, instagram_followers, twitter_followers, tiktok_followers, valuation_date, source)
      VALUES (
        ${player.id},
        ${nilValue},
        ${insta},
        ${twitter},
        ${tiktok},
        ${new Date().toISOString().split('T')[0]},
        'Modeled'
      )
      ON CONFLICT DO NOTHING
    `;
    count++;
  }
  
  console.log(`   ✅ Generated ${count} NIL valuations`);
}

async function printStats() {
  console.log('\n📊 Database Statistics:');
  
  const [teams] = await sql`SELECT COUNT(*) as count FROM teams`;
  const [players] = await sql`SELECT COUNT(*) as count FROM players`;
  const [recruits] = await sql`SELECT COUNT(*) as count FROM recruiting_profiles`;
  const [portal] = await sql`SELECT COUNT(*) as count FROM portal_entries`;
  const [nil] = await sql`SELECT COUNT(*) as count FROM nil_valuations`;
  
  console.log(`   Teams:              ${teams.count}`);
  console.log(`   Players:            ${players.count}`);
  console.log(`   Recruiting Records: ${recruits.count}`);
  console.log(`   Portal Entries:     ${portal.count}`);
  console.log(`   NIL Valuations:     ${nil.count}`);
}

async function main() {
  console.log('🏈 NIL Intelligence - Database Seeder');
  console.log('=====================================');
  
  try {
    const teams = await seedTeams();
    await seedRosters(teams.slice(0, 20)); // Limit to 20 teams for free tier API limits
    await seedRecruits();
    await seedTransfers();
    await generateNILValuations();
    await printStats();
    
    console.log('\n✅ Database seeding complete!');
    console.log('   Run `npm run dev` to see the app with real data.');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
