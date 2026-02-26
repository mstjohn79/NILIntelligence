"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar, Header } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  ArrowRightLeft,
  DollarSign,
  TrendingUp,
} from "lucide-react";

type DashboardData = {
  stats: {
    totalPlayers: number;
    portalEntries: number;
    avgNilValue: number;
    topNilValue: number;
  };
  recentPortal: Array<{
    player_id: string;
    player_name: string;
    position: string;
    from_team: string;
    to_team: string | null;
    status: string;
    nil_value: number;
  }>;
  topPlayers: Array<{
    id: string;
    name: string;
    position: string;
    team: string;
    valuation_usd: number;
  }>;
};

function formatNIL(value: number | null): string {
  if (!value) return "N/A";
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard:", err);
        setLoading(false);
      });
  }, []);

  const stats = data
    ? [
        {
          title: "Total Players",
          value: data.stats.totalPlayers.toLocaleString(),
          icon: Users,
        },
        {
          title: "Portal Entries",
          value: data.stats.portalEntries.toLocaleString(),
          icon: ArrowRightLeft,
        },
        {
          title: "Avg NIL Value",
          value: formatNIL(data.stats.avgNilValue),
          icon: DollarSign,
        },
        {
          title: "Top NIL Value",
          value: formatNIL(data.stats.topNilValue),
          icon: TrendingUp,
        },
      ]
    : [];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              College football roster intelligence at a glance
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-20" />
                    </CardContent>
                  </Card>
                ))
              : stats.map((stat) => (
                  <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                  </Card>
                ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Portal Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Portal Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data?.recentPortal.map((player, idx) => (
                      <Link
                        key={idx}
                        href={`/player/${player.player_id}`}
                        className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0 hover:bg-muted/50 -mx-2 px-2 py-1 rounded transition"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                            {player.player_name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "?"}
                          </div>
                          <div>
                            <p className="font-medium">{player.player_name || "Unknown"}</p>
                            <p className="text-sm text-muted-foreground">
                              {player.position} • {player.from_team}
                              {player.to_team && ` → ${player.to_team}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              player.status === "committed" ? "default" : "secondary"
                            }
                          >
                            {player.status === "committed" ? "Committed" : "Available"}
                          </Badge>
                          <span className="font-semibold text-green-500">
                            {formatNIL(player.nil_value)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top NIL Players */}
            <Card>
              <CardHeader>
                <CardTitle>Top NIL Valuations</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data?.topPlayers.map((player, idx) => (
                      <Link
                        key={idx}
                        href={`/player/${player.id}`}
                        className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0 hover:bg-muted/50 -mx-2 px-2 py-1 rounded transition"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10 text-sm font-bold text-yellow-500">
                            #{idx + 1}
                          </div>
                          <div>
                            <p className="font-medium">{player.name || "Unknown"}</p>
                            <p className="text-sm text-muted-foreground">
                              {player.position} • {player.team}
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-green-500">
                          {formatNIL(player.valuation_usd)}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
