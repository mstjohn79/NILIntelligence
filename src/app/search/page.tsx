'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Player {
  id: string;
  name: string;
  position: string;
  height_inches: number;
  weight_lbs: number;
  class_year: string;
  team: string;
  conference: string;
  team_logo: string;
  nil_value: number;
  portal_status: string | null;
  portal_entry_date: string | null;
  // Stats
  pass_yards: number | null;
  pass_tds: number | null;
  rush_yards: number | null;
  rush_tds: number | null;
  rec_yards: number | null;
  rec_tds: number | null;
  receptions: number | null;
  tackles: number | null;
  sacks: number | null;
  tfl: number | null;
  interceptions: number | null;
  total_tds: number;
}

interface PositionCount {
  position: string;
  count: string;
}

const POSITIONS = ['QB', 'RB', 'WR', 'TE', 'OT', 'IOL', 'EDGE', 'DL', 'LB', 'CB', 'S'];

const BUDGET_PRESETS = [
  { label: 'Under $500K', min: 0, max: 500000 },
  { label: '$500K - $1M', min: 500000, max: 1000000 },
  { label: '$1M - $2M', min: 1000000, max: 2000000 },
  { label: '$2M - $5M', min: 2000000, max: 5000000 },
  { label: 'Over $5M', min: 5000000, max: 99999999 },
  { label: 'Any Budget', min: 0, max: 99999999 },
];

function formatMoney(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

function formatHeight(inches: number): string {
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}'${remainingInches}"`;
}

function getStatDisplay(player: Player): string {
  switch (player.position) {
    case 'QB':
      return `${player.pass_yards?.toLocaleString() || 0} yds, ${player.pass_tds || 0} TD`;
    case 'RB':
      return `${player.rush_yards?.toLocaleString() || 0} yds, ${player.rush_tds || 0} TD`;
    case 'WR':
    case 'TE':
      return `${player.receptions || 0} rec, ${player.rec_yards?.toLocaleString() || 0} yds`;
    case 'EDGE':
    case 'DL':
      return `${player.sacks || 0} sacks, ${player.tfl || 0} TFL`;
    case 'LB':
      return `${player.tackles || 0} tkl, ${player.sacks || 0} sacks`;
    case 'CB':
    case 'S':
      return `${player.tackles || 0} tkl, ${player.interceptions || 0} INT`;
    default:
      return '';
  }
}

export default function CoachSearchPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [positionCounts, setPositionCounts] = useState<PositionCount[]>([]);
  
  // Filters
  const [position, setPosition] = useState('');
  const [budgetPreset, setBudgetPreset] = useState(5); // "Any Budget"
  const [portalOnly, setPortalOnly] = useState(false);
  const [sortBy, setSortBy] = useState('nil_value');
  
  // Stat filters
  const [minSacks, setMinSacks] = useState('');
  const [minTackles, setMinTackles] = useState('');
  const [minPassYards, setMinPassYards] = useState('');
  const [minRushYards, setMinRushYards] = useState('');
  const [minRecYards, setMinRecYards] = useState('');

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (position) params.set('position', position);
      params.set('minBudget', BUDGET_PRESETS[budgetPreset].min.toString());
      params.set('maxBudget', BUDGET_PRESETS[budgetPreset].max.toString());
      if (portalOnly) params.set('portalOnly', 'true');
      params.set('sortBy', sortBy);
      if (minSacks) params.set('minSacks', minSacks);
      if (minTackles) params.set('minTackles', minTackles);
      if (minPassYards) params.set('minPassYards', minPassYards);
      if (minRushYards) params.set('minRushYards', minRushYards);
      if (minRecYards) params.set('minRecYards', minRecYards);

      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      setPlayers(data.players || []);
      setPositionCounts(data.filters?.positions || []);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  }, [position, budgetPreset, portalOnly, sortBy, minSacks, minTackles, minPassYards, minRushYards, minRecYards]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const clearFilters = () => {
    setPosition('');
    setBudgetPreset(5);
    setPortalOnly(false);
    setSortBy('nil_value');
    setMinSacks('');
    setMinTackles('');
    setMinPassYards('');
    setMinRushYards('');
    setMinRecYards('');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold text-emerald-400">NIL Intelligence</Link>
              <span className="text-zinc-500">|</span>
              <h1 className="text-lg font-semibold">Coach Search</h1>
            </div>
            <nav className="flex gap-6 text-sm">
              <Link href="/" className="text-zinc-400 hover:text-white">Dashboard</Link>
              <Link href="/players" className="text-zinc-400 hover:text-white">Players</Link>
              <Link href="/portal" className="text-zinc-400 hover:text-white">Portal</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Find Your Next Player</h2>
          <p className="text-zinc-400">Filter by position, budget, stats, and portal availability</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Position Filter */}
            <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
              <h3 className="font-semibold mb-3 text-sm text-zinc-400 uppercase tracking-wide">Position</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setPosition('')}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    position === '' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  All
                </button>
                {POSITIONS.map(pos => (
                  <button
                    key={pos}
                    onClick={() => setPosition(pos)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition ${
                      position === pos ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Filter */}
            <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
              <h3 className="font-semibold mb-3 text-sm text-zinc-400 uppercase tracking-wide">Budget</h3>
              <div className="space-y-2">
                {BUDGET_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setBudgetPreset(idx)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      budgetPreset === idx ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Portal Filter */}
            <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
              <h3 className="font-semibold mb-3 text-sm text-zinc-400 uppercase tracking-wide">Availability</h3>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={portalOnly}
                  onChange={(e) => setPortalOnly(e.target.checked)}
                  className="w-5 h-5 rounded bg-zinc-800 border-zinc-600 text-emerald-600 focus:ring-emerald-600"
                />
                <span className="text-sm">Transfer Portal Only</span>
              </label>
            </div>

            {/* Stat Filters */}
            <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
              <h3 className="font-semibold mb-3 text-sm text-zinc-400 uppercase tracking-wide">Minimum Stats</h3>
              <div className="space-y-3">
                {(position === 'EDGE' || position === 'DL' || position === 'LB' || !position) && (
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">Sacks</label>
                    <input
                      type="number"
                      value={minSacks}
                      onChange={(e) => setMinSacks(e.target.value)}
                      placeholder="e.g. 8"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-emerald-600 focus:border-emerald-600"
                    />
                  </div>
                )}
                {(position === 'LB' || position === 'CB' || position === 'S' || !position) && (
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">Tackles</label>
                    <input
                      type="number"
                      value={minTackles}
                      onChange={(e) => setMinTackles(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-emerald-600 focus:border-emerald-600"
                    />
                  </div>
                )}
                {(position === 'QB' || !position) && (
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">Pass Yards</label>
                    <input
                      type="number"
                      value={minPassYards}
                      onChange={(e) => setMinPassYards(e.target.value)}
                      placeholder="e.g. 2500"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-emerald-600 focus:border-emerald-600"
                    />
                  </div>
                )}
                {(position === 'RB' || !position) && (
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">Rush Yards</label>
                    <input
                      type="number"
                      value={minRushYards}
                      onChange={(e) => setMinRushYards(e.target.value)}
                      placeholder="e.g. 800"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-emerald-600 focus:border-emerald-600"
                    />
                  </div>
                )}
                {(position === 'WR' || position === 'TE' || !position) && (
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">Rec Yards</label>
                    <input
                      type="number"
                      value={minRecYards}
                      onChange={(e) => setMinRecYards(e.target.value)}
                      placeholder="e.g. 600"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-emerald-600 focus:border-emerald-600"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="w-full py-2 text-sm text-zinc-400 hover:text-white transition"
            >
              Clear All Filters
            </button>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Sort & Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-zinc-400">
                <span className="text-white font-semibold">{players.length}</span> players found
                {portalOnly && <span className="text-emerald-400 ml-2">• Portal Only</span>}
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-emerald-600"
              >
                <option value="nil_value">Sort by NIL Value</option>
                <option value="sacks">Sort by Sacks</option>
                <option value="tackles">Sort by Tackles</option>
                <option value="pass_yards">Sort by Pass Yards</option>
                <option value="rush_yards">Sort by Rush Yards</option>
                <option value="rec_yards">Sort by Rec Yards</option>
              </select>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-zinc-400">Searching players...</p>
              </div>
            ) : players.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900 rounded-xl border border-zinc-800">
                <p className="text-zinc-400 mb-2">No players match your criteria</p>
                <button onClick={clearFilters} className="text-emerald-400 hover:underline">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {players.map((player) => (
                  <Link
                    key={player.id}
                    href={`/player/${player.id}`}
                    className="block bg-zinc-900 rounded-xl p-4 border border-zinc-800 hover:border-zinc-700 transition"
                  >
                    <div className="flex items-center gap-4">
                      {/* Team Logo */}
                      <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {player.team_logo ? (
                          <img src={player.team_logo} alt={player.team} className="w-10 h-10 object-contain" />
                        ) : (
                          <span className="text-zinc-600 text-xs">N/A</span>
                        )}
                      </div>

                      {/* Player Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white truncate">{player.name}</h3>
                          {player.portal_status === 'entered' && (
                            <span className="px-2 py-0.5 bg-emerald-600/20 text-emerald-400 text-xs rounded-full">
                              In Portal
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-zinc-400">
                          <span className="font-medium text-emerald-400">{player.position}</span>
                          <span>{player.team}</span>
                          <span>{formatHeight(player.height_inches)}</span>
                          <span>{player.weight_lbs} lbs</span>
                          <span>{player.class_year}</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm text-zinc-400 mb-1">{getStatDisplay(player)}</p>
                        <p className="text-lg font-bold text-emerald-400">{formatMoney(player.nil_value)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
