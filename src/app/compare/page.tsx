"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sidebar, Header } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X, Search } from "lucide-react";

type Player = {
  id: string;
  name: string;
  position: string;
  team: string;
  valuation_usd: number | null;
  pass_yards: number | null;
  pass_tds: number | null;
  rush_yards: number | null;
  rush_tds: number | null;
  receptions: number | null;
  receiving_yards: number | null;
  receiving_tds: number | null;
  tackles: number | null;
  sacks: number | null;
  interceptions: number | null;
  portal_status: string | null;
};

function formatNIL(value: number | null): string {
  if (!value) return "N/A";
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

function StatComparison({ label, values, higherIsBetter = true }: { 
  label: string; 
  values: (number | null)[]; 
  higherIsBetter?: boolean 
}) {
  const numericValues = values.map(v => v ?? 0);
  const maxVal = Math.max(...numericValues);
  const minVal = Math.min(...numericValues);
  
  return (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-zinc-800 last:border-0">
      <div className="text-sm text-zinc-400">{label}</div>
      {values.map((val, idx) => {
        const isWinner = val !== null && numericValues.filter(v => v > 0).length > 1 && (
          higherIsBetter ? val === maxVal : val === minVal
        ) && maxVal !== minVal;
        return (
          <div 
            key={idx} 
            className={`text-center font-medium ${isWinner ? 'text-emerald-400' : 'text-white'}`}
          >
            {val !== null ? val.toLocaleString() : '-'}
          </div>
        );
      })}
    </div>
  );
}

function CompareContent() {
  const searchParams = useSearchParams();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const playerIds = searchParams.get("ids")?.split(",").filter(Boolean) || [];

  const fetchPlayers = useCallback(async () => {
    if (playerIds.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const playerPromises = playerIds.map(id =>
        fetch(`/api/player/${id}`).then(res => res.json())
      );
      const results = await Promise.all(playerPromises);
      setPlayers(results.map(r => r.player).filter(Boolean));
    } catch (error) {
      console.error("Error fetching players:", error);
    } finally {
      setLoading(false);
    }
  }, [playerIds.join(",")]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const searchPlayers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      const res = await fetch(`/api/players?search=${encodeURIComponent(query)}&limit=10`);
      const data = await res.json();
      setSearchResults(data.players.filter((p: Player) => !playerIds.includes(p.id)));
    } catch (error) {
      console.error("Error searching players:", error);
    } finally {
      setSearching(false);
    }
  };

  const addPlayer = (playerId: string) => {
    const newIds = [...playerIds, playerId];
    window.location.href = `/compare?ids=${newIds.join(",")}`;
  };

  const removePlayer = (playerId: string) => {
    const newIds = playerIds.filter(id => id !== playerId);
    if (newIds.length > 0) {
      window.location.href = `/compare?ids=${newIds.join(",")}`;
    } else {
      window.location.href = `/compare`;
    }
  };

  const getPositionCategory = (position: string | null): string => {
    if (!position) return "other";
    const pos = position.toUpperCase();
    if (["QB"].includes(pos)) return "qb";
    if (["RB", "FB"].includes(pos)) return "rb";
    if (["WR", "TE"].includes(pos)) return "receiver";
    if (["LB", "ILB", "OLB", "MLB"].includes(pos)) return "lb";
    if (["CB", "S", "FS", "SS", "DB"].includes(pos)) return "db";
    if (["DE", "DT", "NT", "DL"].includes(pos)) return "dl";
    return "other";
  };

  const positionCategories = players.map(p => getPositionCategory(p.position));
  const showPassingStats = positionCategories.includes("qb");
  const showRushingStats = positionCategories.some(c => ["qb", "rb"].includes(c));
  const showReceivingStats = positionCategories.some(c => ["rb", "receiver"].includes(c));
  const showDefensiveStats = positionCategories.some(c => ["lb", "db", "dl"].includes(c));

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/players"
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Compare Players</h1>
        </div>
        {players.length < 3 && (
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
          >
            <Plus className="h-4 w-4" />
            Add Player
          </button>
        )}
      </div>

      {/* Search Panel */}
      {showSearch && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search players by name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchPlayers(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 rounded-lg border border-zinc-700 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            {searching && (
              <p className="text-sm text-zinc-400 mt-2">Searching...</p>
            )}
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map(player => (
                  <button
                    key={player.id}
                    onClick={() => addPlayer(player.id)}
                    className="w-full flex items-center justify-between p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
                  >
                    <div>
                      <span className="font-medium">{player.name}</span>
                      <span className="text-sm text-zinc-400 ml-2">
                        {player.position} • {player.team}
                      </span>
                    </div>
                    <Plus className="h-4 w-4 text-emerald-400" />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Players State */}
      {!loading && players.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-zinc-400 mb-4">No players selected for comparison</p>
            <button
              onClick={() => setShowSearch(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
            >
              Add Players to Compare
            </button>
          </CardContent>
        </Card>
      )}

      {/* Player Cards */}
      {players.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {players.map(player => (
              <Card key={player.id} className="relative">
                <button
                  onClick={() => removePlayer(player.id)}
                  className="absolute top-3 right-3 p-1 rounded-full bg-zinc-800 hover:bg-red-600 transition"
                >
                  <X className="h-4 w-4" />
                </button>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-full bg-emerald-600/20 flex items-center justify-center text-xl font-bold text-emerald-400">
                      {player.name?.split(" ").map(n => n[0]).join("") || "?"}
                    </div>
                    <div>
                      <Link 
                        href={`/player/${player.id}`}
                        className="font-semibold text-lg hover:text-emerald-400 transition"
                      >
                        {player.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{player.position}</Badge>
                        <span className="text-sm text-zinc-400">{player.team}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                    <span className="text-sm text-zinc-400">NIL Value</span>
                    <span className="font-semibold text-emerald-400">
                      {formatNIL(player.valuation_usd)}
                    </span>
                  </div>
                  {player.portal_status && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-zinc-400">Portal Status</span>
                      <Badge variant={player.portal_status === "available" ? "default" : "secondary"}>
                        {player.portal_status}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Stats Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Column Headers */}
              <div className="grid grid-cols-3 gap-4 pb-3 border-b border-zinc-700 mb-2">
                <div className="text-sm font-medium text-zinc-400">Stat</div>
                {players.map(player => (
                  <div key={player.id} className="text-center font-medium truncate">
                    {player.name?.split(" ").pop()}
                  </div>
                ))}
              </div>

              {/* NIL Value */}
              <div className="grid grid-cols-3 gap-4 py-3 border-b border-zinc-800">
                <div className="text-sm text-zinc-400">NIL Value</div>
                {players.map(player => (
                  <div key={player.id} className="text-center font-medium text-emerald-400">
                    {formatNIL(player.valuation_usd)}
                  </div>
                ))}
              </div>

              {/* Passing Stats */}
              {showPassingStats && (
                <>
                  <div className="text-xs uppercase text-zinc-500 mt-4 mb-2">Passing</div>
                  <StatComparison 
                    label="Pass Yards" 
                    values={players.map(p => p.pass_yards)} 
                  />
                  <StatComparison 
                    label="Pass TDs" 
                    values={players.map(p => p.pass_tds)} 
                  />
                </>
              )}

              {/* Rushing Stats */}
              {showRushingStats && (
                <>
                  <div className="text-xs uppercase text-zinc-500 mt-4 mb-2">Rushing</div>
                  <StatComparison 
                    label="Rush Yards" 
                    values={players.map(p => p.rush_yards)} 
                  />
                  <StatComparison 
                    label="Rush TDs" 
                    values={players.map(p => p.rush_tds)} 
                  />
                </>
              )}

              {/* Receiving Stats */}
              {showReceivingStats && (
                <>
                  <div className="text-xs uppercase text-zinc-500 mt-4 mb-2">Receiving</div>
                  <StatComparison 
                    label="Receptions" 
                    values={players.map(p => p.receptions)} 
                  />
                  <StatComparison 
                    label="Rec Yards" 
                    values={players.map(p => p.receiving_yards)} 
                  />
                  <StatComparison 
                    label="Rec TDs" 
                    values={players.map(p => p.receiving_tds)} 
                  />
                </>
              )}

              {/* Defensive Stats */}
              {showDefensiveStats && (
                <>
                  <div className="text-xs uppercase text-zinc-500 mt-4 mb-2">Defense</div>
                  <StatComparison 
                    label="Tackles" 
                    values={players.map(p => p.tackles)} 
                  />
                  <StatComparison 
                    label="Sacks" 
                    values={players.map(p => p.sacks)} 
                  />
                  <StatComparison 
                    label="INTs" 
                    values={players.map(p => p.interceptions)} 
                  />
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
            <CompareContent />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
