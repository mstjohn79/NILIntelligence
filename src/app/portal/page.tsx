"use client";

import { useEffect, useState } from "react";
import { Sidebar, Header } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, ArrowRight } from "lucide-react";

type PortalEntry = {
  id: string;
  player_name: string;
  position: string;
  from_team: string;
  to_team: string | null;
  status: string;
  entry_date: string;
  nil_value: number;
};

type PortalStats = {
  total: number;
  available: number;
  committed: number;
  withdrawn: number;
};

function formatNIL(value: number | null): string {
  if (!value) return "N/A";
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

export default function PortalPage() {
  const [entries, setEntries] = useState<PortalEntry[]>([]);
  const [stats, setStats] = useState<PortalStats>({ total: 0, available: 0, committed: 0, withdrawn: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchPortal = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portal?limit=100");
      const data = await res.json();
      setEntries(data.entries || []);
      setStats(data.stats || { total: 0, available: 0, committed: 0, withdrawn: 0 });
    } catch (err) {
      console.error("Failed to fetch portal:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortal();
  }, []);

  const available = entries.filter((e) => e.status === "entered");
  const committed = entries.filter((e) => e.status === "committed");

  const filteredEntries = (list: PortalEntry[]) =>
    search
      ? list.filter(
          (e) =>
            e.player_name?.toLowerCase().includes(search.toLowerCase()) ||
            e.from_team?.toLowerCase().includes(search.toLowerCase())
        )
      : list;

  const renderTable = (list: PortalEntry[], showDestination: boolean = false) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Player</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>{showDestination ? "Transfer" : "From"}</TableHead>
          <TableHead>Entry Date</TableHead>
          <TableHead className="text-right">NIL Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
              </TableRow>
            ))
          : filteredEntries(list).map((entry) => (
              <TableRow key={entry.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium ${
                        entry.status === "committed"
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-green-500/10 text-green-500"
                      }`}
                    >
                      {entry.player_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "?"}
                    </div>
                    <span className="font-medium">{entry.player_name || "Unknown"}</span>
                  </div>
                </TableCell>
                <TableCell>{entry.position || "-"}</TableCell>
                <TableCell>
                  {showDestination ? (
                    <div className="flex items-center gap-2">
                      <span>{entry.from_team}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="text-green-500">{entry.to_team}</span>
                    </div>
                  ) : (
                    entry.from_team || "-"
                  )}
                </TableCell>
                <TableCell>{entry.entry_date?.split("T")[0] || "-"}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary" className="font-mono">
                    {formatNIL(entry.nil_value)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Transfer Portal</h2>
            <p className="text-muted-foreground">
              Track player movements and portal entries
            </p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Entries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-16" /> : stats.total}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Available
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {loading ? <Skeleton className="h-8 w-16" /> : stats.available}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Committed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">
                  {loading ? <Skeleton className="h-8 w-16" /> : stats.committed}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search portal entries..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="available" className="space-y-4">
            <TabsList>
              <TabsTrigger value="available">
                Available ({loading ? "..." : stats.available})
              </TabsTrigger>
              <TabsTrigger value="committed">
                Committed ({loading ? "..." : stats.committed})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({loading ? "..." : stats.total})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="available">
              <Card>
                <CardContent className="pt-6">{renderTable(available)}</CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="committed">
              <Card>
                <CardContent className="pt-6">
                  {renderTable(committed, true)}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all">
              <Card>
                <CardContent className="pt-6">{renderTable(entries)}</CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
