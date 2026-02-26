"use client";

import { Sidebar, Header } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
} from "lucide-react";

// Mock teams data
const teams = [
  { id: 1, name: "Alabama", mascot: "Crimson Tide", conference: "SEC", rosterSize: 85, scholarships: 85, avgNIL: 245000, color: "#9E1B32" },
  { id: 2, name: "Ohio State", mascot: "Buckeyes", conference: "Big Ten", rosterSize: 85, scholarships: 85, avgNIL: 238000, color: "#BB0000" },
  { id: 3, name: "Georgia", mascot: "Bulldogs", conference: "SEC", rosterSize: 85, scholarships: 85, avgNIL: 235000, color: "#BA0C2F" },
  { id: 4, name: "Texas", mascot: "Longhorns", conference: "SEC", rosterSize: 85, scholarships: 85, avgNIL: 228000, color: "#BF5700" },
  { id: 5, name: "Michigan", mascot: "Wolverines", conference: "Big Ten", rosterSize: 85, scholarships: 85, avgNIL: 215000, color: "#00274C" },
  { id: 6, name: "USC", mascot: "Trojans", conference: "Big Ten", rosterSize: 85, scholarships: 85, avgNIL: 210000, color: "#990000" },
  { id: 7, name: "Oregon", mascot: "Ducks", conference: "Big Ten", rosterSize: 85, scholarships: 84, avgNIL: 195000, color: "#154733" },
  { id: 8, name: "Penn State", mascot: "Nittany Lions", conference: "Big Ten", rosterSize: 85, scholarships: 85, avgNIL: 188000, color: "#041E42" },
  { id: 9, name: "LSU", mascot: "Tigers", conference: "SEC", rosterSize: 85, scholarships: 85, avgNIL: 185000, color: "#461D7C" },
  { id: 10, name: "Tennessee", mascot: "Volunteers", conference: "SEC", rosterSize: 85, scholarships: 85, avgNIL: 178000, color: "#FF8200" },
  { id: 11, name: "Florida State", mascot: "Seminoles", conference: "ACC", rosterSize: 85, scholarships: 83, avgNIL: 165000, color: "#782F40" },
  { id: 12, name: "Colorado", mascot: "Buffaloes", conference: "Big 12", rosterSize: 85, scholarships: 85, avgNIL: 155000, color: "#CFB87C" },
];

function formatNIL(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

export default function TeamsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Teams</h2>
            <p className="text-muted-foreground">
              Browse FBS college football programs
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              className="pl-10 max-w-md"
            />
          </div>

          {/* Teams Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {teams.map((team) => (
              <Card key={team.id} className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="flex h-12 w-12 items-center justify-center rounded-lg text-white font-bold"
                      style={{ backgroundColor: team.color }}
                    >
                      {team.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{team.mascot}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Conference</span>
                      <Badge variant="outline">{team.conference}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Scholarships</span>
                      <span className="text-sm font-medium">{team.scholarships}/85</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Avg NIL</span>
                      <span className="text-sm font-medium text-green-500">{formatNIL(team.avgNIL)}</span>
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
