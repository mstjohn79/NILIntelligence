// NIL Valuation Model
// This is a simplified model for MVP - real model would use ML

export type ValuationFactors = {
  recruitingStars: number; // 2-5
  position: string;
  instagramFollowers: number;
  twitterFollowers: number;
  tiktokFollowers: number;
  passingYards?: number;
  rushingYards?: number;
  receivingYards?: number;
  tackles?: number;
  sacks?: number;
  interceptions?: number;
  conferenceMultiplier: number; // SEC/Big Ten = 1.3, others vary
};

// Position premiums (multipliers)
const POSITION_PREMIUMS: Record<string, number> = {
  QB: 2.5,
  RB: 1.4,
  WR: 1.3,
  TE: 1.1,
  OL: 0.9,
  DL: 1.0,
  LB: 1.0,
  DB: 1.1,
  K: 0.6,
  P: 0.5,
};

// Conference multipliers
export const CONFERENCE_MULTIPLIERS: Record<string, number> = {
  SEC: 1.4,
  'Big Ten': 1.35,
  'Big 12': 1.2,
  ACC: 1.15,
  'Pac-12': 1.1,
  'Group of 5': 0.8,
  FCS: 0.5,
};

/**
 * Calculate estimated NIL valuation for a player
 * This is a simplified model based on public data
 */
export function calculateNILValuation(factors: ValuationFactors): number {
  // Base value from recruiting stars
  // 5-star: $500K base, 4-star: $150K, 3-star: $50K, 2-star: $15K
  const starValues: Record<number, number> = {
    5: 500000,
    4: 150000,
    3: 50000,
    2: 15000,
  };
  let baseValue = starValues[factors.recruitingStars] || 25000;

  // Position premium
  const positionMultiplier = POSITION_PREMIUMS[factors.position] || 1.0;
  baseValue *= positionMultiplier;

  // Social media value (roughly $0.05-0.15 per follower)
  const socialValue =
    (factors.instagramFollowers || 0) * 0.1 +
    (factors.twitterFollowers || 0) * 0.05 +
    (factors.tiktokFollowers || 0) * 0.08;

  // Performance bonuses (simplified)
  let performanceBonus = 0;
  if (factors.passingYards && factors.passingYards > 2500) {
    performanceBonus += (factors.passingYards - 2500) * 50;
  }
  if (factors.rushingYards && factors.rushingYards > 1000) {
    performanceBonus += (factors.rushingYards - 1000) * 75;
  }
  if (factors.receivingYards && factors.receivingYards > 800) {
    performanceBonus += (factors.receivingYards - 800) * 60;
  }
  if (factors.sacks && factors.sacks > 5) {
    performanceBonus += (factors.sacks - 5) * 15000;
  }

  // Conference multiplier
  const total = (baseValue + socialValue + performanceBonus) * factors.conferenceMultiplier;

  // Round to nearest $1000
  return Math.round(total / 1000) * 1000;
}

/**
 * Format NIL valuation for display
 */
export function formatNILValue(value: number | null): string {
  if (value === null || value === undefined) return 'N/A';
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
}

/**
 * Get NIL tier based on valuation
 */
export function getNILTier(value: number): string {
  if (value >= 1000000) return 'Elite';
  if (value >= 500000) return 'Premium';
  if (value >= 200000) return 'High';
  if (value >= 100000) return 'Mid';
  if (value >= 50000) return 'Low';
  return 'Minimal';
}
