import { Sidebar, Header } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Download,
} from "lucide-react";

// Mock player data
const players = [
  { id: 1, name: "Arch Manning", position: "QB", team: "Texas", conference: "SEC", stars: 5, nilValue: 3200000, class: "SO" },
  { id: 2, name: "Dylan Raiola", position: "QB", team: "Nebraska", conference: "Big Ten", stars: 5, nilValue: 2100000, class: "FR" },
  { id: 3, name: "Jeremiah Smith", position: "WR", team: "Ohio State", conference: "Big Ten", stars: 5, nilValue: 1800000, class: "FR" },
  { id: 4, name: "Travis Hunter", position: "CB/WR", team: "Colorado", conference: "Big 12", stars: 5, nilValue: 4500000, class: "JR" },
  { id: 5, name: "Nico Iamaleava", position: "QB", team: "Tennessee", conference: "SEC", stars: 5, nilValue: 1500000, class: "SO" },
  { id: 6, name: "Julian Lewis", position: "QB", team: "USC", conference: "Big Ten", stars: 5, nilValue: 1200000, class: "FR" },
  { id: 7, name: "Keelon Russell", position: "QB", team: "Alabama", conference: "SEC", stars: 5, nilValue: 900000, class: "FR" },
  { id: 8, name: "Bryce Underwood", position: "QB", team: "Michigan", conference: "Big Ten", stars: 5, nilValue: 850000, class: "FR" },
];

function formatNIL(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

export default function PlayersPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Players</h2>
              <p className="text-muted-foreground">
                Search and discover college football players
              </p>
            </div>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search players by name..."
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

          {/* Players Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Players</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Conference</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-right">NIL Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.map((player) => (
                    <TableRow key={player.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                            {player.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium">{player.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{player.position}</TableCell>
                      <TableCell>{player.team}</TableCell>
                      <TableCell>{player.conference}</TableCell>
                      <TableCell>{player.class}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: player.stars }).map((_, i) => (
                            <span key={i} className="text-yellow-500">★</span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="font-mono">
                          {formatNIL(player.nilValue)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
