// CollegeFootballData.com API Client
// Free tier: 1,000 calls/month

const CFBD_BASE_URL = 'https://api.collegefootballdata.com';

type CFBDRequestOptions = {
  endpoint: string;
  params?: Record<string, string | number | undefined>;
};

async function cfbdFetch<T>({ endpoint, params }: CFBDRequestOptions): Promise<T> {
  const apiKey = process.env.CFBD_API_KEY;
  
  if (!apiKey) {
    throw new Error('CFBD_API_KEY environment variable is not set');
  }

  const url = new URL(`${CFBD_BASE_URL}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    },
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(`CFBD API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Types for CFBD responses
export type CFBDPlayer = {
  id: number;
  first_name: string;
  last_name: string;
  team: string;
  weight: number;
  height: number;
  jersey: number;
  position: string;
  hometown: string;
  year: number;
};

export type CFBDTeam = {
  id: number;
  school: string;
  mascot: string;
  abbreviation: string;
  conference: string;
  division: string;
  color: string;
  alt_color: string;
  logos: string[];
};

export type CFBDTransfer = {
  season: number;
  firstName: string;
  lastName: string;
  position: string;
  origin: string;
  destination: string | null;
  transferDate: string;
  rating: number;
  stars: number;
  eligibility: string;
};

export type CFBDRecruit = {
  id: number;
  athleteId: number;
  recruitType: string;
  year: number;
  ranking: number;
  name: string;
  school: string;
  committedTo: string;
  position: string;
  height: number;
  weight: number;
  stars: number;
  rating: number;
  city: string;
  stateProvince: string;
};

// API Functions
export async function getTeams(conference?: string): Promise<CFBDTeam[]> {
  return cfbdFetch<CFBDTeam[]>({
    endpoint: '/teams',
    params: { conference },
  });
}

export async function getTeamRoster(team: string, year?: number): Promise<CFBDPlayer[]> {
  return cfbdFetch<CFBDPlayer[]>({
    endpoint: '/roster',
    params: { team, year },
  });
}

export async function getTransfers(year: number): Promise<CFBDTransfer[]> {
  return cfbdFetch<CFBDTransfer[]>({
    endpoint: '/player/transfer',
    params: { year },
  });
}

export async function getRecruits(
  year: number,
  options?: {
    classification?: 'HighSchool' | 'JUCO' | 'PrepSchool';
    position?: string;
    state?: string;
    team?: string;
  }
): Promise<CFBDRecruit[]> {
  return cfbdFetch<CFBDRecruit[]>({
    endpoint: '/recruiting/players',
    params: {
      year,
      ...options,
    },
  });
}

export async function getPlayerStats(
  year: number,
  options?: {
    team?: string;
    conference?: string;
    startWeek?: number;
    endWeek?: number;
    seasonType?: 'regular' | 'postseason';
    category?: string;
  }
) {
  return cfbdFetch({
    endpoint: '/stats/player/season',
    params: {
      year,
      ...options,
    },
  });
}
