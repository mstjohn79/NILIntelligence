"use client";

import { Sidebar, Header } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ArrowRightLeft,
  DollarSign,
  TrendingUp,
} from "lucide-react";

// Mock data for dashboard
const stats = [
  {
    title: "Total Players",
    value: "12,847",
    change: "+2.5%",
    icon: Users,
  },
  {
    title: "Portal Entries",
    value: "1,234",
    change: "+18.2%",
    icon: ArrowRightLeft,
  },
  {
    title: "Avg NIL Value",
    value: "$142K",
    change: "+5.7%",
    icon: DollarSign,
  },
  {
    title: "Top Prospect Value",
    value: "$3.2M",
    change: "+12.1%",
    icon: TrendingUp,
  },
];

const recentPortalActivity = [
  { name: "Marcus Johnson", position: "QB", from: "Texas", to: "Ohio State", nil: "$1.2M" },
  { name: "DeShawn Williams", position: "WR", from: "Alabama", to: null, nil: "$890K" },
  { name: "Tyler Smith", position: "RB", from: "Georgia", to: "USC", nil: "$750K" },
  { name: "Chris Davis", position: "CB", from: "LSU", to: null, nil: "$420K" },
  { name: "James Wilson", position: "DE", from: "Michigan", to: "Oregon", nil: "$650K" },
];

export default function Dashboard() {
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
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-green-500">{stat.change} from last month</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Portal Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Portal Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPortalActivity.map((player, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                        {player.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium">{player.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {player.position} • {player.from}
                          {player.to && ` → ${player.to}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={player.to ? "default" : "secondary"}>
                        {player.to ? "Committed" : "Available"}
                      </Badge>
                      <span className="font-semibold text-green-500">{player.nil}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
