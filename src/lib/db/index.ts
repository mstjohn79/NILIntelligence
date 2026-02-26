import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const sql = neon(process.env.DATABASE_URL);

export type Player = {
  id: string;
  cfbd_id: number | null;
  name: string;
  position: string | null;
  height_inches: number | null;
  weight_lbs: number | null;
  hometown_city: string | null;
  hometown_state: string | null;
  current_team: string | null;
  class_year: string | null;
  eligibility_remaining: number | null;
  composite_rating: number | null;
  star_rating: number | null;
  nil_valuation: number | null;
  portal_status: string | null;
  instagram_followers: number | null;
  twitter_followers: number | null;
  tiktok_followers: number | null;
  created_at: Date;
  updated_at: Date;
};

export type Team = {
  id: string;
  cfbd_id: number | null;
  name: string;
  mascot: string | null;
  abbreviation: string | null;
  conference: string | null;
  division: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
};

export type PortalEntry = {
  id: string;
  player_id: string;
  player_name: string;
  position: string | null;
  from_team: string | null;
  to_team: string | null;
  status: 'entered' | 'committed' | 'withdrawn';
  entry_date: Date;
  commit_date: Date | null;
  nil_valuation: number | null;
  star_rating: number | null;
};
