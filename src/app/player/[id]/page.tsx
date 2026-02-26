'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Player {
  id: string;
  name: string;
  position: string;
  height_inches: number;
  weight_lbs: number;
  class_year: string;
  hometown_city: string;
  hometown_state: string;
  team: string;
  conference: string;
  team_logo: string;
  team_color: string;
  nil_value: number;
  nil_source: string;
  valuation_date: string;
  instagram_followers: number;
  twitter_followers: number;
  tiktok_followers: number;
  portal_status: string | null;
  portal_entry_date: string | null;
  transfer_year: number | null;
  from_team: string | null;
  from_team_logo: string | null;
  // Stats
  games_played: number;
  pass_yards: number | null;
  pass_tds: number | null;
  interceptions: number | null;
  completion_pct: number | null;
  qb_rating: number | null;
  rush_yards: number | null;
  rush_tds: number | null;
  yards_per_carry: number | null;
  receptions: number | null;
  rec_yards: number | null;
  rec_tds: number | null;
  yards_per_rec: number | null;
  tackles: number | null;
  solo_tackles: number | null;
  sacks: number | null;
  tfl: number | null;
  qb_hurries: number | null;
  forced_fumbles: number | null;
  pass_deflections: number | null;
  games_started: number | null;
  pancakes: number | null;
  // Recruiting
  star_rating: number | null;
  composite_rating: number | null;
  national_rank: number | null;
  position_rank: number | null;
}

interface SimilarPlayer {
  id: string;
  name: string;
  position: string;
  team: string;
  team_logo: string;
  nil_value: number;
  portal_status: string | null;
}

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

function formatFollowers(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

function StatCard({ label, value, suffix = '' }: { label: string; value: number | string | null; suffix?: string }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="bg-zinc-800/50 rounded-lg p-3">
      <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">{label}</p>
      <p className="text-xl font-bold text-white">{value}{suffix}</p>
    </div>
  );
}

export default function PlayerProfilePage() {
  const params = useParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [similarPlayers, setSimilarPlayers] = useState<SimilarPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayer() {
      try {
        const res = await fetch(`/api/player/${params.id}`);
        const data = await res.json();
        setPlayer(data.player);
        setSimilarPlayers(data.similarPlayers || []);
      } catch (error) {
        console.error('Error fetching player:', error);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchPlayer();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Player not found</p>
          <Link href="/search" className="text-emerald-400 hover:underline">Back to search</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold text-emerald-400">NIL Intelligence</Link>
            </div>
            <nav className="flex gap-6 text-sm">
              <Link href="/" className="text-zinc-400 hover:text-white">Dashboard</Link>
              <Link href="/search" className="text-zinc-400 hover:text-white">Coach Search</Link>
              <Link href="/portal" className="text-zinc-400 hover:text-white">Portal</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link href="/search" className="text-zinc-400 hover:text-white text-sm mb-6 inline-block">
          ← Back to search
        </Link>

        {/* Player Header */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden mb-8">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Team Logo & Basic Info */}
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {player.team_logo ? (
                    <img src={player.team_logo} alt={player.team} className="w-16 h-16 object-contain" />
                  ) : (
                    <span className="text-zinc-600 text-sm">N/A</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{player.name}</h1>
                    {player.portal_status === 'entered' && (
                      <span className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-full font-medium">
                        Available in Portal
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-zinc-400">
                    <span className="text-emerald-400 font-semibold text-lg">{player.position}</span>
                    <span>{player.team}</span>
                    <span>{player.conference}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-zinc-500 mt-2">
                    <span>{formatHeight(player.height_inches)}</span>
                    <span>{player.weight_lbs} lbs</span>
                    <span>{player.class_year}</span>
                    {player.hometown_city && (
                      <span>{player.hometown_city}, {player.hometown_state}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* NIL Value */}
              <div className="md:ml-auto text-right">
                <p className="text-zinc-500 text-sm mb-1">NIL Valuation</p>
                <p className="text-4xl font-bold text-emerald-400">{formatMoney(player.nil_value)}</p>
                <p className="text-zinc-500 text-xs mt-1">Source: {player.nil_source || 'On3'}</p>
              </div>
            </div>
          </div>

          {/* Portal Info Banner */}
          {player.portal_status === 'entered' && (
            <div className="bg-emerald-900/30 border-t border-emerald-800/50 px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <div>
                  <p className="font-semibold text-emerald-400">Transfer Portal Entry</p>
                  <p className="text-sm text-zinc-400">
                    Entered portal from {player.from_team || player.team}
                    {player.transfer_year && ` • ${player.transfer_year} Transfer Window`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* 2025 Season Stats */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h2 className="text-lg font-semibold mb-4">2025 Season Stats</h2>
              
              {/* QB Stats */}
              {player.position === 'QB' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard label="Pass Yards" value={player.pass_yards?.toLocaleString()} />
                  <StatCard label="Pass TDs" value={player.pass_tds} />
                  <StatCard label="INTs" value={player.interceptions} />
                  <StatCard label="Comp %" value={player.completion_pct} suffix="%" />
                  <StatCard label="QB Rating" value={player.qb_rating} />
                  <StatCard label="Rush Yards" value={player.rush_yards?.toLocaleString()} />
                  <StatCard label="Rush TDs" value={player.rush_tds} />
                  <StatCard label="Games" value={player.games_played} />
                </div>
              )}

              {/* RB Stats */}
              {player.position === 'RB' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard label="Rush Yards" value={player.rush_yards?.toLocaleString()} />
                  <StatCard label="Rush TDs" value={player.rush_tds} />
                  <StatCard label="YPC" value={player.yards_per_carry} />
                  <StatCard label="Receptions" value={player.receptions} />
                  <StatCard label="Rec Yards" value={player.rec_yards?.toLocaleString()} />
                  <StatCard label="Games" value={player.games_played} />
                </div>
              )}

              {/* WR/TE Stats */}
              {(player.position === 'WR' || player.position === 'TE') && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard label="Receptions" value={player.receptions} />
                  <StatCard label="Rec Yards" value={player.rec_yards?.toLocaleString()} />
                  <StatCard label="Rec TDs" value={player.rec_tds} />
                  <StatCard label="YPR" value={player.yards_per_rec} />
                  <StatCard label="Games" value={player.games_played} />
                </div>
              )}

              {/* EDGE/DL Stats */}
              {(player.position === 'EDGE' || player.position === 'DL') && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard label="Sacks" value={player.sacks} />
                  <StatCard label="TFL" value={player.tfl} />
                  <StatCard label="Tackles" value={player.tackles} />
                  <StatCard label="QB Hurries" value={player.qb_hurries} />
                  <StatCard label="Forced Fumbles" value={player.forced_fumbles} />
                  <StatCard label="Games" value={player.games_played} />
                </div>
              )}

              {/* LB Stats */}
              {player.position === 'LB' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard label="Tackles" value={player.tackles} />
                  <StatCard label="Solo Tackles" value={player.solo_tackles} />
                  <StatCard label="Sacks" value={player.sacks} />
                  <StatCard label="TFL" value={player.tfl} />
                  <StatCard label="INTs" value={player.interceptions} />
                  <StatCard label="Pass Deflections" value={player.pass_deflections} />
                  <StatCard label="Games" value={player.games_played} />
                </div>
              )}

              {/* CB/S Stats */}
              {(player.position === 'CB' || player.position === 'S') && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard label="Tackles" value={player.tackles} />
                  <StatCard label="INTs" value={player.interceptions} />
                  <StatCard label="Pass Deflections" value={player.pass_deflections} />
                  <StatCard label="Forced Fumbles" value={player.forced_fumbles} />
                  <StatCard label="Games" value={player.games_played} />
                </div>
              )}

              {/* OL Stats */}
              {(player.position === 'OT' || player.position === 'IOL') && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard label="Games Started" value={player.games_started} />
                  <StatCard label="Pancakes" value={player.pancakes} />
                  <StatCard label="Sacks Allowed" value={player.sacks_allowed} />
                  <StatCard label="Penalties" value={player.penalties} />
                </div>
              )}
            </div>

            {/* Recruiting Profile */}
            {player.star_rating && (
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <h2 className="text-lg font-semibold mb-4">Recruiting Profile</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Star Rating</p>
                    <p className="text-xl font-bold text-amber-400">
                      {'★'.repeat(player.star_rating)}{'☆'.repeat(5 - player.star_rating)}
                    </p>
                  </div>
                  <StatCard label="Composite" value={player.composite_rating?.toFixed(2)} />
                  <StatCard label="National Rank" value={`#${player.national_rank}`} />
                  <StatCard label="Position Rank" value={`#${player.position_rank}`} />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Social Media */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h2 className="text-lg font-semibold mb-4">Social Following</h2>
              <div className="space-y-3">
                {player.instagram_followers > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Instagram</span>
                    <span className="font-semibold">{formatFollowers(player.instagram_followers)}</span>
                  </div>
                )}
                {player.twitter_followers > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Twitter/X</span>
                    <span className="font-semibold">{formatFollowers(player.twitter_followers)}</span>
                  </div>
                )}
                {player.tiktok_followers > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">TikTok</span>
                    <span className="font-semibold">{formatFollowers(player.tiktok_followers)}</span>
                  </div>
                )}
                <div className="border-t border-zinc-800 pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Total Reach</span>
                    <span className="font-semibold text-emerald-400">
                      {formatFollowers(
                        (player.instagram_followers || 0) + 
                        (player.twitter_followers || 0) + 
                        (player.tiktok_followers || 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Similar Players */}
            {similarPlayers.length > 0 && (
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <h2 className="text-lg font-semibold mb-4">Similar Players</h2>
                <div className="space-y-3">
                  {similarPlayers.map((p) => (
                    <Link
                      key={p.id}
                      href={`/player/${p.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition"
                    >
                      <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {p.team_logo && (
                          <img src={p.team_logo} alt={p.team} className="w-6 h-6 object-contain" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-zinc-500">{p.team}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-400">{formatMoney(p.nil_value)}</p>
                        {p.portal_status === 'entered' && (
                          <span className="text-xs text-emerald-400">Portal</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition text-sm font-medium">
                  Add to Watchlist
                </button>
                <button className="w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition text-sm font-medium">
                  Export Profile
                </button>
                <button className="w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition text-sm font-medium">
                  Compare Players
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
