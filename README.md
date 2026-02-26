# NIL Intelligence

College Football Roster Intelligence Platform - A comprehensive roster management and player acquisition tool for college football programs.

## Features

- **Player Search & Discovery** - Search players by position, stats, NIL value, and availability
- **Transfer Portal Tracker** - Monitor portal entries and commitments in real-time
- **Team Rosters** - Browse FBS team rosters with scholarship tracking
- **NIL Valuations** - Modeled NIL estimates based on recruiting, performance, and social metrics

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Neon Postgres
- **Data Source**: CollegeFootballData.com API

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) account (free tier available)
- A [CollegeFootballData.com](https://collegefootballdata.com/key) API key (free)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/mstjohn79/NILIntelligence.git
   cd NILIntelligence
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Fill in your environment variables in `.env.local`:
   - `DATABASE_URL` - Your Neon Postgres connection string
   - `CFBD_API_KEY` - Your CollegeFootballData.com API key

5. Run the database schema:
   ```bash
   # Copy and run the SQL in src/lib/db/schema.sql in your Neon console
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── page.tsx         # Dashboard
│   ├── players/         # Player search
│   ├── portal/          # Transfer portal
│   └── teams/           # Team rosters
├── components/          # React components
│   ├── layout/          # Sidebar, Header
│   └── ui/              # shadcn/ui components
└── lib/                 # Utilities
    ├── db/              # Database schema & client
    ├── cfbd.ts          # CollegeFootballData API client
    └── nil-model.ts     # NIL valuation model
```

## License

MIT
