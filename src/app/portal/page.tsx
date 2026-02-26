import { Sidebar, Header } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  ArrowRight,
} from "lucide-react";

// Mock portal data
const portalEntries = [
  { id: 1, name: "Marcus Johnson", position: "QB", from: "Texas", to: "Ohio State", status: "committed", nilValue: 1200000, stars: 4, date: "2026-01-15" },
  { id: 2, name: "DeShawn Williams", position: "WR", from: "Alabama", to: null, status: "entered", nilValue: 890000, stars: 4, date: "2026-02-01" },
  { id: 3, name: "Tyler Smith", position: "RB", from: "Georgia", to: "USC", status: "committed", nilValue: 750000, stars: 5, date: "2026-01-20" },
  { id: 4, name: "Chris Davis", position: "CB", from: "LSU", to: null, status: "entered", nilValue: 420000, stars: 3, date: "2026-02-10" },
  { id: 5, name: "James Wilson", position: "DE", from: "Michigan", to: "Oregon", status: "committed", nilValue: 650000, stars: 4, date: "2026-01-28" },
  { id: 6, name: "Anthony Brown", position: "LB", from: "Florida", to: null, status: "entered", nilValue: 380000, stars: 3, date: "2026-02-15" },
  { id: 7, name: "Michael Lee", position: "OL", from: "Penn State", to: null, status: "entered", nilValue: 290000, stars: 4, date: "2026-02-18" },
  { id: 8, name: "David Jackson", position: "S", from: "Oklahoma", to: "Texas A&M", status: "committed", nilValue: 520000, stars: 4, date: "2026-02-05" },
];

function formatNIL(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

export default function PortalPage() {
  const available = portalEntries.filter(p => p.status === 'entered');
  const committed = portalEntries.filter(p => p.status === 'committed');

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
                <div className="text-2xl font-bold">{portalEntries.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Available
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{available.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Committed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">{committed.length}</div>
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
              <TabsTrigger value="available">Available ({available.length})</TabsTrigger>
              <TabsTrigger value="committed">Committed ({committed.length})</TabsTrigger>
              <TabsTrigger value="all">All ({portalEntries.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="available">
              <Card>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Entry Date</TableHead>
                        <TableHead className="text-right">NIL Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {available.map((entry) => (
                        <TableRow key={entry.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/10 text-xs font-medium text-green-500">
                                {entry.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="font-medium">{entry.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{entry.position}</TableCell>
                          <TableCell>{entry.from}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: entry.stars }).map((_, i) => (
                                <span key={i} className="text-yellow-500">★</span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>{entry.date}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary" className="font-mono">
                              {formatNIL(entry.nilValue)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="committed">
              <Card>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Transfer</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead className="text-right">NIL Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {committed.map((entry) => (
                        <TableRow key={entry.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 text-xs font-medium text-blue-500">
                                {entry.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="font-medium">{entry.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{entry.position}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{entry.from}</span>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <span className="text-green-500">{entry.to}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: entry.stars }).map((_, i) => (
                                <span key={i} className="text-yellow-500">★</span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary" className="font-mono">
                              {formatNIL(entry.nilValue)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all">
              <Card>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">NIL Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {portalEntries.map((entry) => (
                        <TableRow key={entry.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            <span className="font-medium">{entry.name}</span>
                          </TableCell>
                          <TableCell>{entry.position}</TableCell>
                          <TableCell>{entry.from}</TableCell>
                          <TableCell>{entry.to || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={entry.status === 'committed' ? 'default' : 'secondary'}>
                              {entry.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-mono">{formatNIL(entry.nilValue)}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
