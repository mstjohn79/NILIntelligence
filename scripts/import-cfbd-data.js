/**
 * Import historical stats, game logs, and recruiting data from CFBD API
 * All data is FREE via collegefootballdata.com
 */

const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_H3XumWpzdL6v@ep-misty-firefly-aimleo5o-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require';
const CFBD_API_KEY = 'I3PJO4m98j2M/uZXFHm1NcP/ZcDjtyU6SwVF9ouGp+gplGxdBjCR/xCWboU+vwZp';

const sql = neon(DATABASE_URL);

async function cfbdFetch(endpoint) {
  const res = await fetch(`https://api.collegefootballdata.com${endpoint}`, {
    headers: { 'Authorization': `Bearer ${CFBD_API_KEY}` }
  });
  if (!res.ok) throw new Error(`CFBD API error: ${res.status}`);
  return res.json();
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Create tables for historical data
async function createTables() {
  console.log('Creating tables...');
  
  // Historical season stats (multiple years)
  await sql`
    CREATE TABLE IF NOT EXISTS player_season_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      player_id UUID REFERENCES players(id) ON DELETE CASCADE,
      cfbd_player_id TEXT,
      season INTEGER NOT NULL,
      team TEXT,
      games INTEGER,
      -- Passing
      pass_completions INTEGER,
      pass_attempts INTEGER,
      pass_yards INTEGER,
      pass_tds INTEGER,
      interceptions INTEGER,
      -- Rushing
      rush_attempts INTEGER,
      rush_yards INTEGER,
      rush_tds INTEGER,
      rush_long INTEGER,
      -- Receiving
      receptions INTEGER,
      rec_yards INTEGER,
      rec_tds INTEGER,
      rec_long INTEGER,
      -- Defense
      tackles DECIMAL(4,1),
      solo_tackles INTEGER,
      sacks DECIMAL(3,1),
      tfl DECIMAL(3,1),
      qb_hurries INTEGER,
      interceptions_def INTEGER,
      pass_deflections INTEGER,
      forced_fumbles INTEGER,
      fumble_recoveries INTEGER,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(player_id, season)
    )
  `;

  // Game logs
  await sql`
    CREATE TABLE IF NOT EXISTS player_game_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      player_id UUID REFERENCES players(id) ON DELETE CASCADE,
      cfbd_player_id TEXT,
      cfbd_game_id INTEGER,
      season INTEGER NOT NULL,
      week INTEGER,
      opponent TEXT,
      home_away TEXT,
      -- Stats
      pass_completions INTEGER,
      pass_attempts INTEGER,
      pass_yards INTEGER,
      pass_tds INTEGER,
      interceptions INTEGER,
      rush_attempts INTEGER,
      rush_yards INTEGER,
      rush_tds INTEGER,
      receptions INTEGER,
      rec_yards INTEGER,
      rec_tds INTEGER,
      tackles DECIMAL(3,1),
      sacks DECIMAL(2,1),
      tfl DECIMAL(2,1),
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(player_id, cfbd_game_id)
    )
  `;

  // Recruiting profiles  
  await sql`
    CREATE TABLE IF NOT EXISTS player_recruiting (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      player_id UUID REFERENCES players(id) ON DELETE CASCADE,
      cfbd_recruit_id TEXT,
      cfbd_athlete_id TEXT,
      recruit_year INTEGER,
      stars INTEGER,
      rating DECIMAL(5,4),
      national_rank INTEGER,
      position_rank INTEGER,
      state_rank INTEGER,
      high_school TEXT,
      city TEXT,
      state TEXT,
      committed_to TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(player_id)
    )
  `;

  console.log('Tables created!');
}

// Get our players and their CFBD IDs
async function getPlayers() {
  return await sql`
    SELECT p.id, p.name, p.position, t.name as team
    FROM players p
    JOIN teams t ON p.current_team_id = t.id
  `;
}

// Import historical season stats (2020-2025)
async function importSeasonStats(players) {
  console.log('\n📊 Importing historical season stats...');
  const years = [2020, 2021, 2022, 2023, 2024];
  const teams = [...new Set(players.map(p => p.team))];
  
  let imported = 0;
  
  for (const team of teams) {
    console.log(`  Fetching stats for ${team}...`);
    
    for (const year of years) {
      try {
        await sleep(100); // Rate limit
        const stats = await cfbdFetch(`/stats/player/season?year=${year}&team=${encodeURIComponent(team)}`);
        
        // Group stats by player
        const playerStats = {};
        for (const stat of stats) {
          if (!playerStats[stat.player]) {
            playerStats[stat.player] = { 
              playerId: stat.playerId,
              season: stat.season,
              team: stat.team
            };
          }
          
          // Map stat types
          const s = playerStats[stat.player];
          switch(stat.statType) {
            case 'COMPLETIONS': s.pass_completions = parseInt(stat.stat); break;
            case 'ATT': 
              if (stat.category === 'passing') s.pass_attempts = parseInt(stat.stat);
              else if (stat.category === 'rushing') s.rush_attempts = parseInt(stat.stat);
              break;
            case 'YDS':
              if (stat.category === 'passing') s.pass_yards = parseInt(stat.stat);
              else if (stat.category === 'rushing') s.rush_yards = parseInt(stat.stat);
              else if (stat.category === 'receiving') s.rec_yards = parseInt(stat.stat);
              break;
            case 'TD':
              if (stat.category === 'passing') s.pass_tds = parseInt(stat.stat);
              else if (stat.category === 'rushing') s.rush_tds = parseInt(stat.stat);
              else if (stat.category === 'receiving') s.rec_tds = parseInt(stat.stat);
              break;
            case 'INT':
              if (stat.category === 'passing') s.interceptions = parseInt(stat.stat);
              else if (stat.category === 'defensive') s.interceptions_def = parseInt(stat.stat);
              break;
            case 'REC': s.receptions = parseInt(stat.stat); break;
            case 'TOT': if (stat.category === 'defensive') s.tackles = parseFloat(stat.stat); break;
            case 'SOLO': s.solo_tackles = parseInt(stat.stat); break;
            case 'SACKS': s.sacks = parseFloat(stat.stat); break;
            case 'TFL': s.tfl = parseFloat(stat.stat); break;
            case 'QB HUR': s.qb_hurries = parseInt(stat.stat); break;
            case 'PD': s.pass_deflections = parseInt(stat.stat); break;
            case 'FF': s.forced_fumbles = parseInt(stat.stat); break;
            case 'FR': s.fumble_recoveries = parseInt(stat.stat); break;
            case 'LONG':
              if (stat.category === 'rushing') s.rush_long = parseInt(stat.stat);
              else if (stat.category === 'receiving') s.rec_long = parseInt(stat.stat);
              break;
          }
        }
        
        // Match to our players and insert
        for (const [name, s] of Object.entries(playerStats)) {
          const player = players.find(p => p.name.toLowerCase() === name.toLowerCase() && p.team === team);
          if (player) {
            try {
              await sql`
                INSERT INTO player_season_history (
                  player_id, cfbd_player_id, season, team,
                  pass_completions, pass_attempts, pass_yards, pass_tds, interceptions,
                  rush_attempts, rush_yards, rush_tds, rush_long,
                  receptions, rec_yards, rec_tds, rec_long,
                  tackles, solo_tackles, sacks, tfl, qb_hurries,
                  interceptions_def, pass_deflections, forced_fumbles, fumble_recoveries
                ) VALUES (
                  ${player.id}, ${s.playerId}, ${s.season}, ${s.team},
                  ${s.pass_completions || null}, ${s.pass_attempts || null}, ${s.pass_yards || null}, ${s.pass_tds || null}, ${s.interceptions || null},
                  ${s.rush_attempts || null}, ${s.rush_yards || null}, ${s.rush_tds || null}, ${s.rush_long || null},
                  ${s.receptions || null}, ${s.rec_yards || null}, ${s.rec_tds || null}, ${s.rec_long || null},
                  ${s.tackles || null}, ${s.solo_tackles || null}, ${s.sacks || null}, ${s.tfl || null}, ${s.qb_hurries || null},
                  ${s.interceptions_def || null}, ${s.pass_deflections || null}, ${s.forced_fumbles || null}, ${s.fumble_recoveries || null}
                )
                ON CONFLICT (player_id, season) DO UPDATE SET
                  pass_yards = EXCLUDED.pass_yards,
                  pass_tds = EXCLUDED.pass_tds,
                  rush_yards = EXCLUDED.rush_yards,
                  tackles = EXCLUDED.tackles,
                  sacks = EXCLUDED.sacks
              `;
              imported++;
            } catch (e) {
              // Skip duplicates
            }
          }
        }
      } catch (e) {
        console.log(`    Error fetching ${team} ${year}: ${e.message}`);
      }
    }
  }
  
  console.log(`  ✅ Imported ${imported} season stat records`);
}

// Import game logs for current season
async function importGameLogs(players) {
  console.log('\n🏈 Importing game logs...');
  const teams = [...new Set(players.map(p => p.team))];
  let imported = 0;
  
  for (const team of teams) {
    console.log(`  Fetching game logs for ${team}...`);
    
    try {
      await sleep(100);
      const games = await cfbdFetch(`/games/players?year=2024&seasonType=regular&team=${encodeURIComponent(team)}`);
      
      for (const game of games) {
        const teamData = game.teams.find(t => t.team === team);
        if (!teamData) continue;
        
        // Extract player stats from categories
        const gameStats = {};
        for (const cat of teamData.categories || []) {
          for (const type of cat.types || []) {
            for (const athlete of type.athletes || []) {
              if (!gameStats[athlete.id]) {
                gameStats[athlete.id] = { 
                  name: athlete.name,
                  cfbd_game_id: game.id
                };
              }
              const s = gameStats[athlete.id];
              
              // Parse stats
              if (cat.name === 'passing') {
                if (type.name === 'C/ATT') {
                  const [c, a] = athlete.stat.split('/');
                  s.pass_completions = parseInt(c);
                  s.pass_attempts = parseInt(a);
                }
                if (type.name === 'YDS') s.pass_yards = parseInt(athlete.stat);
                if (type.name === 'TD') s.pass_tds = parseInt(athlete.stat);
                if (type.name === 'INT') s.interceptions = parseInt(athlete.stat);
              }
              if (cat.name === 'rushing') {
                if (type.name === 'CAR') s.rush_attempts = parseInt(athlete.stat);
                if (type.name === 'YDS') s.rush_yards = parseInt(athlete.stat);
                if (type.name === 'TD') s.rush_tds = parseInt(athlete.stat);
              }
              if (cat.name === 'receiving') {
                if (type.name === 'REC') s.receptions = parseInt(athlete.stat);
                if (type.name === 'YDS') s.rec_yards = parseInt(athlete.stat);
                if (type.name === 'TD') s.rec_tds = parseInt(athlete.stat);
              }
              if (cat.name === 'defensive') {
                if (type.name === 'TOT') s.tackles = parseFloat(athlete.stat);
                if (type.name === 'SACKS') s.sacks = parseFloat(athlete.stat);
                if (type.name === 'TFL') s.tfl = parseFloat(athlete.stat);
              }
            }
          }
        }
        
        // Find opponent
        const opponent = game.teams.find(t => t.team !== team)?.team || 'Unknown';
        const homeAway = teamData.homeAway;
        
        // Match and insert
        for (const [cfbdId, s] of Object.entries(gameStats)) {
          const player = players.find(p => p.name.toLowerCase() === s.name.toLowerCase() && p.team === team);
          if (player) {
            try {
              await sql`
                INSERT INTO player_game_logs (
                  player_id, cfbd_player_id, cfbd_game_id, season, opponent, home_away,
                  pass_completions, pass_attempts, pass_yards, pass_tds, interceptions,
                  rush_attempts, rush_yards, rush_tds,
                  receptions, rec_yards, rec_tds,
                  tackles, sacks, tfl
                ) VALUES (
                  ${player.id}, ${cfbdId}, ${game.id}, 2024, ${opponent}, ${homeAway},
                  ${s.pass_completions || null}, ${s.pass_attempts || null}, ${s.pass_yards || null}, ${s.pass_tds || null}, ${s.interceptions || null},
                  ${s.rush_attempts || null}, ${s.rush_yards || null}, ${s.rush_tds || null},
                  ${s.receptions || null}, ${s.rec_yards || null}, ${s.rec_tds || null},
                  ${s.tackles || null}, ${s.sacks || null}, ${s.tfl || null}
                )
                ON CONFLICT (player_id, cfbd_game_id) DO NOTHING
              `;
              imported++;
            } catch (e) {
              // Skip
            }
          }
        }
      }
    } catch (e) {
      console.log(`    Error: ${e.message}`);
    }
  }
  
  console.log(`  ✅ Imported ${imported} game log records`);
}

// Import recruiting data
async function importRecruitingData(players) {
  console.log('\n⭐ Importing recruiting data...');
  const years = [2020, 2021, 2022, 2023, 2024];
  let imported = 0;
  
  for (const year of years) {
    console.log(`  Fetching ${year} recruiting class...`);
    
    try {
      await sleep(100);
      const recruits = await cfbdFetch(`/recruiting/players?year=${year}`);
      
      for (const r of recruits) {
        // Match to our players by name
        const player = players.find(p => 
          p.name.toLowerCase() === r.name.toLowerCase() ||
          p.name.toLowerCase().includes(r.name.split(' ').pop().toLowerCase())
        );
        
        if (player) {
          try {
            await sql`
              INSERT INTO player_recruiting (
                player_id, cfbd_recruit_id, cfbd_athlete_id, recruit_year,
                stars, rating, national_rank, position_rank, state_rank,
                high_school, city, state, committed_to
              ) VALUES (
                ${player.id}, ${r.id}, ${r.athleteId}, ${r.year},
                ${r.stars}, ${r.rating}, ${r.ranking}, ${r.positionRank || null}, ${r.stateRank || null},
                ${r.school}, ${r.city}, ${r.stateProvince}, ${r.committedTo}
              )
              ON CONFLICT (player_id) DO UPDATE SET
                stars = EXCLUDED.stars,
                rating = EXCLUDED.rating,
                national_rank = EXCLUDED.national_rank
            `;
            imported++;
          } catch (e) {
            // Skip
          }
        }
      }
    } catch (e) {
      console.log(`    Error: ${e.message}`);
    }
  }
  
  console.log(`  ✅ Imported ${imported} recruiting records`);
}

async function main() {
  console.log('🏈 CFBD Data Import');
  console.log('==================');
  console.log('Importing FREE data from CollegeFootballData.com\n');
  
  await createTables();
  const players = await getPlayers();
  console.log(`Found ${players.length} players to match\n`);
  
  await importSeasonStats(players);
  await importGameLogs(players);
  await importRecruitingData(players);
  
  console.log('\n✅ Import complete!');
  
  // Show summary
  const seasonCount = await sql`SELECT COUNT(*) as count FROM player_season_history`;
  const gameCount = await sql`SELECT COUNT(*) as count FROM player_game_logs`;
  const recruitCount = await sql`SELECT COUNT(*) as count FROM player_recruiting`;
  
  console.log('\n📊 Summary:');
  console.log(`  Season history records: ${seasonCount[0].count}`);
  console.log(`  Game log records: ${gameCount[0].count}`);
  console.log(`  Recruiting records: ${recruitCount[0].count}`);
}

main().catch(console.error);
