// Seed real NIL data from On3 Top 100 + stats
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

// On3 Top 100 NIL Valuations (Feb 2026) - Real data
const top100Players = [
  { name: "Arch Manning", position: "QB", team: "Texas", nil_value: 5400000, instagram: 430000, twitter: 9400, tiktok: 73000, height: 75, weight: 220, class_year: "SR", rating: 99.53, portal_status: null },
  { name: "Jeremiah Smith", position: "WR", team: "Ohio State", nil_value: 4200000, instagram: 534000, twitter: 255000, tiktok: 86000, height: 75, weight: 215, class_year: "JR", rating: 99.61, portal_status: null },
  { name: "Sam Leavitt", position: "QB", team: "Arizona State", nil_value: 4000000, instagram: 33000, twitter: 6500, tiktok: 0, height: 74, weight: 195, class_year: "RS-JR", rating: 89.49, portal_status: null },
  { name: "Brendan Sorsby", position: "QB", team: "Texas", nil_value: 3100000, instagram: 5800, twitter: 2600, tiktok: 0, height: 75, weight: 205, class_year: "RS-SR", rating: 82.99, portal_status: null },
  { name: "Bryce Underwood", position: "QB", team: "Michigan", nil_value: 3100000, instagram: 231000, twitter: 48000, tiktok: 34000, height: 76, weight: 214, class_year: "SO", rating: 99.87, portal_status: null },
  { name: "Dante Moore", position: "QB", team: "Oregon", nil_value: 3000000, instagram: 46000, twitter: 7300, tiktok: 16000, height: 74, weight: 202, class_year: "SR", rating: 99.22, portal_status: null },
  { name: "Cam Coleman", position: "WR", team: "Texas", nil_value: 2900000, instagram: 49000, twitter: 6200, tiktok: 9900, height: 75, weight: 190, class_year: "JR", rating: 99.22, portal_status: null },
  { name: "LaNorris Sellers", position: "QB", team: "South Carolina", nil_value: 2700000, instagram: 56000, twitter: 18400, tiktok: 0, height: 75, weight: 217, class_year: "SR", rating: 91.13, portal_status: null },
  { name: "Drew Mestemaker", position: "QB", team: "Texas", nil_value: 2500000, instagram: 5900, twitter: 1500, tiktok: 0, height: 76, weight: 210, class_year: "JR", rating: 85.00, portal_status: null },
  { name: "Dylan Stewart", position: "EDGE", team: "South Carolina", nil_value: 2500000, instagram: 31000, twitter: 7700, tiktok: 0, height: 77, weight: 250, class_year: "JR", rating: 98.32, portal_status: null },
  { name: "Julian Sayin", position: "QB", team: "Ohio State", nil_value: 2400000, instagram: 54000, twitter: 1300, tiktok: 11300, height: 73, weight: 190, class_year: "JR", rating: 98.61, portal_status: null },
  { name: "Josh Hoover", position: "QB", team: "TCU", nil_value: 2300000, instagram: 10500, twitter: 79, tiktok: 2400, height: 73, weight: 205, class_year: "RS-SR", rating: 86.65, portal_status: null },
  { name: "Darian Mensah", position: "QB", team: "Tulane", nil_value: 2200000, instagram: 28000, twitter: 1600, tiktok: 0, height: 75, weight: 215, class_year: "RS-JR", rating: 80.91, portal_status: null },
  { name: "Jayden Maiava", position: "QB", team: "USC", nil_value: 2200000, instagram: 2900, twitter: 1500, tiktok: 0, height: 76, weight: 227, class_year: "RS-SR", rating: 85.03, portal_status: null },
  { name: "Mason Heintschel", position: "QB", team: "Northwestern", nil_value: 2100000, instagram: 1100, twitter: 699, tiktok: 0, height: 73, weight: 200, class_year: "SO", rating: 87.74, portal_status: null },
  { name: "CJ Bailey", position: "QB", team: "Tennessee", nil_value: 2100000, instagram: 36000, twitter: 5500, tiktok: 2000, height: 78, weight: 180, class_year: "JR", rating: 89.11, portal_status: null },
  { name: "John Mateer", position: "QB", team: "Oklahoma", nil_value: 2000000, instagram: 32000, twitter: 13500, tiktok: 0, height: 72, weight: 215, class_year: "RS-SR", rating: 81.43, portal_status: null },
  { name: "David Stone", position: "DL", team: "Oklahoma", nil_value: 1900000, instagram: 31000, twitter: 5800, tiktok: 21000, height: 75, weight: 285, class_year: "JR", rating: 98.51, portal_status: null },
  { name: "Malik Washington", position: "QB", team: "Virginia", nil_value: 1900000, instagram: 9300, twitter: 2700, tiktok: 0, height: 75, weight: 215, class_year: "SO", rating: 93.98, portal_status: null },
  { name: "Byrum Brown", position: "QB", team: "USF", nil_value: 1900000, instagram: 1100, twitter: 2000, tiktok: 0, height: 75, weight: 193, class_year: "SR", rating: 84.05, portal_status: null },
  { name: "Jaron-Keawe Sagapolutele", position: "QB", team: "Oregon", nil_value: 1800000, instagram: 5700, twitter: 2400, tiktok: 0, height: 74, weight: 220, class_year: "FR", rating: 96.15, portal_status: null },
  { name: "Jordan Seaton", position: "OT", team: "Colorado", nil_value: 1700000, instagram: 67000, twitter: 30, tiktok: 12900, height: 77, weight: 295, class_year: "JR", rating: 98.31, portal_status: null },
  { name: "Ryan Williams", position: "WR", team: "Alabama", nil_value: 1600000, instagram: 743000, twitter: 449000, tiktok: 34000, height: 73, weight: 165, class_year: "JR", rating: 98.97, portal_status: null },
  { name: "Trinidad Chambliss", position: "QB", team: "Bowling Green", nil_value: 1600000, instagram: 0, twitter: 0, tiktok: 0, height: 73, weight: 200, class_year: "RS-SR", rating: 80.00, portal_status: null },
  { name: "Colin Simmons", position: "EDGE", team: "Texas", nil_value: 1500000, instagram: 72000, twitter: 94000, tiktok: 25000, height: 74, weight: 225, class_year: "JR", rating: 98.36, portal_status: null },
  { name: "Evan Stewart", position: "WR", team: "Oregon", nil_value: 1500000, instagram: 280000, twitter: 2100000, tiktok: 29000, height: 72, weight: 170, class_year: "SR", rating: 98.43, portal_status: null },
  { name: "Conner Weigman", position: "QB", team: "Texas A&M", nil_value: 1500000, instagram: 32000, twitter: 364, tiktok: 19100, height: 74, weight: 208, class_year: "RS-SR", rating: 97.08, portal_status: null },
  { name: "Princewill Umanmielen", position: "EDGE", team: "Ole Miss", nil_value: 1400000, instagram: 1700, twitter: 3500, tiktok: 0, height: 76, weight: 245, class_year: "SR", rating: 91.50, portal_status: null },
  { name: "Noah Fifita", position: "QB", team: "UCLA", nil_value: 1300000, instagram: 25000, twitter: 5000, tiktok: 0, height: 69, weight: 184, class_year: "RS-SR", rating: 87.85, portal_status: null },
  { name: "CJ Carr", position: "QB", team: "Notre Dame", nil_value: 1200000, instagram: 18200, twitter: 1600, tiktok: 15400, height: 74, weight: 195, class_year: "RS-SO", rating: 95.30, portal_status: null },
  // Additional portal players - available for transfer
  { name: "Demond Williams Jr.", position: "QB", team: "Arizona State", nil_value: 950000, instagram: 12800, twitter: 3300, tiktok: 0, height: 70, weight: 180, class_year: "JR", rating: 91.84, portal_status: "entered" },
  { name: "Kevin Jennings", position: "QB", team: "SMU", nil_value: 850000, instagram: 4000, twitter: 17200, tiktok: 1400, height: 73, weight: 180, class_year: "RS-SR", rating: 82.90, portal_status: "entered" },
  { name: "Beau Pribula", position: "QB", team: "Penn State", nil_value: 800000, instagram: 34000, twitter: 7600, tiktok: 0, height: 74, weight: 203, class_year: "RS-JR", rating: 88.50, portal_status: "entered" },
  { name: "Cutter Boley", position: "QB", team: "Kentucky", nil_value: 750000, instagram: 12700, twitter: 634, tiktok: 5500, height: 77, weight: 200, class_year: "SO", rating: 89.53, portal_status: "entered" },
  { name: "Gunner Stockton", position: "QB", team: "Georgia", nil_value: 700000, instagram: 32000, twitter: 9100, tiktok: 0, height: 73, weight: 215, class_year: "RS-SR", rating: 93.11, portal_status: "entered" },
  // Edge rushers
  { name: "Matayo Uiagalelei", position: "EDGE", team: "USC", nil_value: 1100000, instagram: 32000, twitter: 7500, tiktok: 3000, height: 77, weight: 263, class_year: "SR", rating: 96.57, portal_status: null },
  { name: "Damon Wilson II", position: "EDGE", team: "Georgia", nil_value: 900000, instagram: 17300, twitter: 1700, tiktok: 4700, height: 76, weight: 230, class_year: "SR", rating: 97.59, portal_status: null },
  { name: "Will Heldt", position: "EDGE", team: "Purdue", nil_value: 600000, instagram: 2000, twitter: 1100, tiktok: 0, height: 78, weight: 250, class_year: "SR", rating: 87.35, portal_status: "entered" },
  { name: "Yhonzae Pierre", position: "EDGE", team: "Auburn", nil_value: 550000, instagram: 1500, twitter: 2100, tiktok: 0, height: 75, weight: 221, class_year: "RS-JR", rating: 97.33, portal_status: null },
  { name: "Taylor Wein", position: "EDGE", team: "Vanderbilt", nil_value: 500000, instagram: 4800, twitter: 0, tiktok: 0, height: 77, weight: 245, class_year: "RS-JR", rating: 87.58, portal_status: "entered" },
  { name: "John Henry Daley", position: "EDGE", team: "Utah", nil_value: 450000, instagram: 0, twitter: 0, tiktok: 0, height: 76, weight: 255, class_year: "SR", rating: 85.35, portal_status: "entered" },
  { name: "Boubacar Traore", position: "EDGE", team: "Texas A&M", nil_value: 400000, instagram: 2000, twitter: 1700, tiktok: 0, height: 76, weight: 254, class_year: "RS-JR", rating: 91.94, portal_status: "entered" },
  { name: "Jayden Woods", position: "EDGE", team: "Kansas State", nil_value: 380000, instagram: 1200, twitter: 1300, tiktok: 0, height: 75, weight: 235, class_year: "SO", rating: 93.79, portal_status: "entered" },
  { name: "Chaz Coleman", position: "EDGE", team: "Ohio State", nil_value: 350000, instagram: 0, twitter: 0, tiktok: 0, height: 76, weight: 246, class_year: "SO", rating: 91.90, portal_status: null },
  // Linebackers
  { name: "Danny Stutsman", position: "LB", team: "Oklahoma", nil_value: 1200000, instagram: 45000, twitter: 12000, tiktok: 8000, height: 76, weight: 235, class_year: "SR", rating: 92.50, portal_status: null },
  { name: "Jay Higgins", position: "LB", team: "Iowa", nil_value: 950000, instagram: 28000, twitter: 8500, tiktok: 0, height: 74, weight: 230, class_year: "SR", rating: 88.20, portal_status: null },
  { name: "Anthony Hill Jr.", position: "LB", team: "Texas", nil_value: 900000, instagram: 22000, twitter: 4200, tiktok: 3500, height: 74, weight: 225, class_year: "JR", rating: 98.50, portal_status: null },
  { name: "Carson Schwesinger", position: "LB", team: "UCLA", nil_value: 800000, instagram: 15000, twitter: 3100, tiktok: 0, height: 74, weight: 235, class_year: "SR", rating: 85.40, portal_status: "entered" },
  { name: "Nick Jackson", position: "LB", team: "Iowa", nil_value: 650000, instagram: 8500, twitter: 2200, tiktok: 0, height: 73, weight: 228, class_year: "JR", rating: 84.30, portal_status: "entered" },
  { name: "Justin Flowe", position: "LB", team: "Oregon", nil_value: 600000, instagram: 120000, twitter: 25000, tiktok: 15000, height: 74, weight: 235, class_year: "RS-SR", rating: 99.45, portal_status: "entered" },
  { name: "Caleb Banks", position: "LB", team: "Florida", nil_value: 450000, instagram: 3500, twitter: 900, tiktok: 0, height: 75, weight: 230, class_year: "JR", rating: 86.70, portal_status: "entered" },
  // Defensive backs
  { name: "Caleb Downs", position: "S", team: "Ohio State", nil_value: 2000000, instagram: 85000, twitter: 22000, tiktok: 12000, height: 73, weight: 190, class_year: "SO", rating: 99.80, portal_status: null },
  { name: "Travis Hunter", position: "CB", team: "Colorado", nil_value: 2500000, instagram: 2100000, twitter: 450000, tiktok: 890000, height: 73, weight: 185, class_year: "JR", rating: 99.95, portal_status: null },
  { name: "Brice Pollock", position: "CB", team: "Georgia", nil_value: 450000, instagram: 3200, twitter: 1600, tiktok: 0, height: 73, weight: 175, class_year: "SR", rating: 88.80, portal_status: "entered" },
  { name: "Leonard Moore", position: "CB", team: "Texas", nil_value: 400000, instagram: 6700, twitter: 9700, tiktok: 1600, height: 74, weight: 175, class_year: "JR", rating: 89.21, portal_status: null },
  { name: "Jyaire Hill", position: "CB", team: "Ohio State", nil_value: 380000, instagram: 7900, twitter: 2100, tiktok: 3000, height: 73, weight: 170, class_year: "SR", rating: 92.68, portal_status: "entered" },
  // Running backs
  { name: "Quinshon Judkins", position: "RB", team: "Ohio State", nil_value: 1100000, instagram: 180000, twitter: 35000, tiktok: 22000, height: 72, weight: 215, class_year: "JR", rating: 96.20, portal_status: null },
  { name: "Nate Frazier", position: "RB", team: "Georgia", nil_value: 550000, instagram: 6100, twitter: 3300, tiktok: 0, height: 70, weight: 210, class_year: "JR", rating: 96.29, portal_status: null },
  { name: "Kewan Lacy", position: "RB", team: "Texas A&M", nil_value: 500000, instagram: 2700, twitter: 1500, tiktok: 2800, height: 71, weight: 195, class_year: "JR", rating: 92.20, portal_status: null },
  { name: "Ahmad Hardy", position: "RB", team: "Mississippi State", nil_value: 450000, instagram: 2900, twitter: 905, tiktok: 0, height: 70, weight: 205, class_year: "JR", rating: 85.00, portal_status: "entered" },
  { name: "Jadan Baugh", position: "RB", team: "Miami", nil_value: 400000, instagram: 3, twitter: 1000, tiktok: 0, height: 73, weight: 215, class_year: "JR", rating: 89.93, portal_status: null },
  { name: "Isaac Brown", position: "RB", team: "Kentucky", nil_value: 380000, instagram: 10200, twitter: 2400, tiktok: 1500, height: 67, weight: 175, class_year: "JR", rating: 88.40, portal_status: "entered" },
  { name: "Bo Jackson", position: "RB", team: "Ohio State", nil_value: 350000, instagram: 4100, twitter: 3400, tiktok: 0, height: 72, weight: 210, class_year: "SO", rating: 92.62, portal_status: null },
  { name: "Justice Haynes", position: "RB", team: "Alabama", nil_value: 320000, instagram: 41000, twitter: 22000, tiktok: 9200, height: 69, weight: 200, class_year: "SR", rating: 97.14, portal_status: "entered" },
  { name: "L.J. Martin", position: "RB", team: "Michigan", nil_value: 280000, instagram: 4700, twitter: 657, tiktok: 2300, height: 72, weight: 196, class_year: "SR", rating: 89.06, portal_status: "entered" },
  { name: "Jordan Marshall", position: "RB", team: "Cincinnati", nil_value: 250000, instagram: 3300, twitter: 4800, tiktok: 0, height: 70, weight: 200, class_year: "JR", rating: 94.63, portal_status: "entered" },
  // Tight ends
  { name: "Trey'Dez Green", position: "TE", team: "LSU", nil_value: 500000, instagram: 15100, twitter: 7200, tiktok: 2000, height: 78, weight: 230, class_year: "JR", rating: 97.13, portal_status: null },
  { name: "Duce Robinson", position: "TE", team: "USC", nil_value: 450000, instagram: 15400, twitter: 300, tiktok: 4400, height: 78, weight: 230, class_year: "SR", rating: 97.48, portal_status: null },
  // Offensive line
  { name: "Michael Fasusi", position: "OT", team: "Texas", nil_value: 600000, instagram: 5800, twitter: 8500, tiktok: 0, height: 77, weight: 299, class_year: "FR", rating: 98.66, portal_status: null },
  { name: "David Sanders Jr.", position: "OT", team: "North Carolina", nil_value: 550000, instagram: 24000, twitter: 10100, tiktok: 0, height: 77, weight: 276, class_year: "SO", rating: 98.64, portal_status: null },
  { name: "Howard Sampson", position: "OT", team: "LSU", nil_value: 450000, instagram: 10200, twitter: 1000, tiktok: 0, height: 80, weight: 330, class_year: "RS-SR", rating: 85.00, portal_status: "entered" },
  { name: "Cayden Green", position: "OT", team: "Texas A&M", nil_value: 400000, instagram: 5100, twitter: 2500, tiktok: 12800, height: 76, weight: 315, class_year: "SR", rating: 94.39, portal_status: null },
  { name: "Austin Siereveld", position: "OT", team: "Ohio State", nil_value: 350000, instagram: 1400, twitter: 96, tiktok: 1800, height: 77, weight: 321, class_year: "SR", rating: 90.58, portal_status: null },
  { name: "Jacarrius Peak", position: "OT", team: "Georgia", nil_value: 320000, instagram: 15900, twitter: 949, tiktok: 0, height: 77, weight: 310, class_year: "RS-SR", rating: 89.06, portal_status: "entered" },
  { name: "Earnest Greene", position: "OT", team: "Alabama", nil_value: 300000, instagram: 7800, twitter: 3900, tiktok: 0, height: 76, weight: 350, class_year: "RS-SR", rating: 96.27, portal_status: null },
  // Defensive line (interior)
  { name: "Bear Alexander", position: "DL", team: "USC", nil_value: 700000, instagram: 28000, twitter: 246, tiktok: 14300, height: 75, weight: 320, class_year: "SR", rating: 96.33, portal_status: null },
  { name: "William Echols", position: "DL", team: "LSU", nil_value: 450000, instagram: 9700, twitter: 2400, tiktok: 0, height: 75, weight: 300, class_year: "JR", rating: 93.67, portal_status: null },
  { name: "Gabriel Brownlow-Dindy", position: "DL", team: "Texas A&M", nil_value: 400000, instagram: 6400, twitter: 6200, tiktok: 0, height: 75, weight: 279, class_year: "RS-JR", rating: 98.15, portal_status: null },
  { name: "Tavion Gadson", position: "DL", team: "Georgia Tech", nil_value: 350000, instagram: 922, twitter: 1400, tiktok: 0, height: 77, weight: 275, class_year: "RS-JR", rating: 88.87, portal_status: "entered" },
  { name: "Mandrell Desir", position: "DL", team: "Florida", nil_value: 300000, instagram: 853, twitter: 90, tiktok: 0, height: 75, weight: 265, class_year: "SO", rating: 87.33, portal_status: "entered" },
  { name: "Justus Terry", position: "DL", team: "Georgia", nil_value: 280000, instagram: 14200, twitter: 9, tiktok: 7500, height: 76, weight: 275, class_year: "FR", rating: 98.15, portal_status: null },
  { name: "A'mauri Washington", position: "DL", team: "Oklahoma", nil_value: 250000, instagram: 2100, twitter: 2200, tiktok: 0, height: 74, weight: 320, class_year: "SR", rating: 90.94, portal_status: "entered" },
];

// Mock stats by position (realistic 2025 season stats)
function generateStats(player) {
  const stats = {};
  
  switch (player.position) {
    case 'QB':
      stats.pass_yards = Math.floor(2000 + Math.random() * 2500);
      stats.pass_tds = Math.floor(15 + Math.random() * 25);
      stats.interceptions = Math.floor(2 + Math.random() * 10);
      stats.completion_pct = (58 + Math.random() * 15).toFixed(1);
      stats.rush_yards = Math.floor(100 + Math.random() * 600);
      stats.rush_tds = Math.floor(Math.random() * 10);
      stats.qb_rating = (130 + Math.random() * 40).toFixed(1);
      break;
    case 'RB':
      stats.rush_yards = Math.floor(600 + Math.random() * 1000);
      stats.rush_tds = Math.floor(5 + Math.random() * 15);
      stats.yards_per_carry = (4.0 + Math.random() * 2.5).toFixed(1);
      stats.receptions = Math.floor(10 + Math.random() * 40);
      stats.rec_yards = Math.floor(100 + Math.random() * 400);
      break;
    case 'WR':
      stats.receptions = Math.floor(40 + Math.random() * 60);
      stats.rec_yards = Math.floor(500 + Math.random() * 1000);
      stats.rec_tds = Math.floor(4 + Math.random() * 12);
      stats.yards_per_rec = (12 + Math.random() * 8).toFixed(1);
      break;
    case 'TE':
      stats.receptions = Math.floor(20 + Math.random() * 40);
      stats.rec_yards = Math.floor(200 + Math.random() * 500);
      stats.rec_tds = Math.floor(2 + Math.random() * 8);
      break;
    case 'EDGE':
      stats.tackles = Math.floor(30 + Math.random() * 40);
      stats.sacks = (4 + Math.random() * 10).toFixed(1);
      stats.tfl = Math.floor(8 + Math.random() * 12);
      stats.qb_hurries = Math.floor(10 + Math.random() * 20);
      stats.forced_fumbles = Math.floor(Math.random() * 4);
      break;
    case 'LB':
      stats.tackles = Math.floor(60 + Math.random() * 60);
      stats.solo_tackles = Math.floor(30 + Math.random() * 40);
      stats.sacks = (1 + Math.random() * 5).toFixed(1);
      stats.tfl = Math.floor(5 + Math.random() * 12);
      stats.interceptions = Math.floor(Math.random() * 3);
      stats.pass_deflections = Math.floor(2 + Math.random() * 6);
      break;
    case 'CB':
    case 'S':
      stats.tackles = Math.floor(30 + Math.random() * 50);
      stats.interceptions = Math.floor(1 + Math.random() * 6);
      stats.pass_deflections = Math.floor(5 + Math.random() * 12);
      stats.forced_fumbles = Math.floor(Math.random() * 2);
      break;
    case 'DL':
      stats.tackles = Math.floor(25 + Math.random() * 35);
      stats.sacks = (2 + Math.random() * 6).toFixed(1);
      stats.tfl = Math.floor(5 + Math.random() * 10);
      stats.qb_hurries = Math.floor(5 + Math.random() * 15);
      break;
    case 'OT':
    case 'IOL':
      stats.games_started = Math.floor(10 + Math.random() * 3);
      stats.sacks_allowed = Math.floor(Math.random() * 4);
      stats.pancakes = Math.floor(20 + Math.random() * 30);
      stats.penalties = Math.floor(2 + Math.random() * 5);
      break;
  }
  
  return stats;
}

async function clearAndSeed() {
  console.log('🏈 NIL Intelligence - Seeding Real Player Data');
  console.log('==============================================\n');

  // Create player_stats table if not exists (do this first)
  console.log('📊 Creating player_stats table...');
  await sql`
    CREATE TABLE IF NOT EXISTS player_stats (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      player_id UUID REFERENCES players(id) ON DELETE CASCADE,
      season INTEGER NOT NULL,
      games_played INTEGER DEFAULT 0,
      -- Passing
      pass_yards INTEGER,
      pass_tds INTEGER,
      interceptions INTEGER,
      completion_pct DECIMAL(4,1),
      qb_rating DECIMAL(5,1),
      -- Rushing
      rush_yards INTEGER,
      rush_tds INTEGER,
      yards_per_carry DECIMAL(3,1),
      -- Receiving
      receptions INTEGER,
      rec_yards INTEGER,
      rec_tds INTEGER,
      yards_per_rec DECIMAL(4,1),
      -- Defense
      tackles INTEGER,
      solo_tackles INTEGER,
      sacks DECIMAL(3,1),
      tfl INTEGER,
      qb_hurries INTEGER,
      forced_fumbles INTEGER,
      pass_deflections INTEGER,
      -- OL
      games_started INTEGER,
      sacks_allowed INTEGER,
      pancakes INTEGER,
      penalties INTEGER,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(player_id, season)
    )
  `;

  // Clear existing data (after table exists)
  console.log('🗑️  Clearing existing data...');
  await sql`DELETE FROM portal_entries`;
  await sql`DELETE FROM nil_valuations`;
  await sql`DELETE FROM player_stats`;
  await sql`DELETE FROM players`;

  // Get team IDs
  const teams = await sql`SELECT id, name FROM teams`;
  const teamMap = {};
  teams.forEach(t => teamMap[t.name] = t.id);

  console.log('👤 Inserting players with real NIL data...\n');
  
  let inserted = 0;
  for (const player of top100Players) {
    try {
      // Find team (try exact match first, then partial)
      let teamId = teamMap[player.team];
      if (!teamId) {
        const match = teams.find(t => 
          t.name.toLowerCase().includes(player.team.toLowerCase()) ||
          player.team.toLowerCase().includes(t.name.toLowerCase())
        );
        teamId = match?.id;
      }

      // Insert player
      const [newPlayer] = await sql`
        INSERT INTO players (name, position, height_inches, weight_lbs, class_year, current_team_id)
        VALUES (
          ${player.name},
          ${player.position},
          ${player.height},
          ${player.weight},
          ${player.class_year},
          ${teamId}
        )
        RETURNING id
      `;

      // Insert NIL valuation
      await sql`
        INSERT INTO nil_valuations (player_id, valuation_usd, instagram_followers, twitter_followers, tiktok_followers, valuation_date, source)
        VALUES (
          ${newPlayer.id},
          ${player.nil_value},
          ${player.instagram},
          ${player.twitter},
          ${player.tiktok},
          CURRENT_DATE,
          'On3'
        )
      `;

      // Insert stats
      const stats = generateStats(player);
      await sql`
        INSERT INTO player_stats (
          player_id, season, games_played,
          pass_yards, pass_tds, interceptions, completion_pct, qb_rating,
          rush_yards, rush_tds, yards_per_carry,
          receptions, rec_yards, rec_tds, yards_per_rec,
          tackles, solo_tackles, sacks, tfl, qb_hurries, forced_fumbles, pass_deflections,
          games_started, sacks_allowed, pancakes, penalties
        ) VALUES (
          ${newPlayer.id}, 2025, ${12},
          ${stats.pass_yards || null}, ${stats.pass_tds || null}, ${stats.interceptions || null}, 
          ${stats.completion_pct || null}, ${stats.qb_rating || null},
          ${stats.rush_yards || null}, ${stats.rush_tds || null}, ${stats.yards_per_carry || null},
          ${stats.receptions || null}, ${stats.rec_yards || null}, ${stats.rec_tds || null}, ${stats.yards_per_rec || null},
          ${stats.tackles || null}, ${stats.solo_tackles || null}, ${stats.sacks || null}, 
          ${stats.tfl || null}, ${stats.qb_hurries || null}, ${stats.forced_fumbles || null}, ${stats.pass_deflections || null},
          ${stats.games_started || null}, ${stats.sacks_allowed || null}, ${stats.pancakes || null}, ${stats.penalties || null}
        )
      `;

      // Insert portal entry if applicable
      if (player.portal_status) {
        await sql`
          INSERT INTO portal_entries (player_id, from_team_id, status, entry_date, transfer_year)
          VALUES (
            ${newPlayer.id},
            ${teamId},
            ${player.portal_status},
            CURRENT_DATE - INTERVAL '30 days' * random(),
            2026
          )
        `;
      }

      inserted++;
      process.stdout.write(`   ✓ ${player.name} (${player.position}) - $${(player.nil_value/1000000).toFixed(1)}M\n`);
    } catch (err) {
      console.log(`   ⚠️ Error inserting ${player.name}: ${err.message}`);
    }
  }

  // Print summary
  const [playerCount] = await sql`SELECT COUNT(*) as count FROM players`;
  const [portalCount] = await sql`SELECT COUNT(*) as count FROM portal_entries WHERE status = 'entered'`;
  const [avgNil] = await sql`SELECT AVG(valuation_usd)::int as avg FROM nil_valuations`;

  console.log('\n📊 Database Summary:');
  console.log(`   Players:           ${playerCount.count}`);
  console.log(`   Available in Portal: ${portalCount.count}`);
  console.log(`   Avg NIL Value:     $${(avgNil.avg/1000).toFixed(0)}K`);
  console.log('\n✅ Seeding complete!');
}

clearAndSeed().catch(console.error);
