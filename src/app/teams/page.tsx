"use client";

import { useEffect, useState } from "react";
import { Sidebar, Header } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

type Team = {
  id: string;
  name: string;
  mascot: string;
  abbreviation: string;
  conference: string;
  logo_url: string | null;
  primary_color: string | null;
  roster_size: number;
  avg_nil: number;
};

function formatNIL(value: number | null): string {
  if (!value) return "N/A";
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teams");
      const data = await res.json();
      setTeams(data.teams || []);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const filteredTeams = search
    ? teams.filter(
        (t) =>
          t.name?.toLowerCase().includes(search.toLowerCase()) ||
          t.conference?.toLowerCase().includes(search.toLowerCase())
      )
    : teams;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Teams</h2>
            <p className="text-muted-foreground">
              {teams.length} FBS college football programs
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search teams or conferences..."
              className="pl-10 max-w-md"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Teams Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div>
                          <Skeleton className="h-5 w-24 mb-1" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              : filteredTeams.map((team) => (
                  <Card
                    key={team.id}
                    className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        {team.logo_url ? (
                          <img
                            src={team.logo_url}
                            alt={team.name}
                            className="h-12 w-12 object-contain"
                          />
                        ) : (
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-lg text-white font-bold"
                            style={{
                              backgroundColor: team.primary_color || "#333",
                            }}
                          >
                            {team.abbreviation?.substring(0, 2) ||
                              team.name?.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-lg">{team.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {team.mascot}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Conference
                          </span>
                          <Badge variant="outline">{team.conference || "Independent"}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Roster Size
                          </span>
                          <span className="text-sm font-medium">
                            {team.roster_size || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Avg NIL
                          </span>
                          <span className="text-sm font-medium text-green-500">
                            {formatNIL(team.avg_nil)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </main>
      </div>
    </div>
  );
}
