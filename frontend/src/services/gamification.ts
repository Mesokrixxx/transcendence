import fetchAPI from './fetchAPI';

export type RewardDetails = {
  id: number;
  code: string;
  name: string;
  description: string;
};

export type GamificationProgress = {
  achievements: {
    achievement: RewardDetails;
    unlocked: boolean;
    unlockedAt: string | null;
    stats: {
      gamesPlayed: number;
      wins: number;
      elo: number;
    };
  }[];
  badges: {
    badge: RewardDetails;
    record: number;
    featured: boolean;
    unlocked: boolean;
    assignedAt: string | null;
  }[];
};

export function getMyProgress() {
  return fetchAPI<GamificationProgress>({
    path: '/gamification/me',
    method: 'get',
  });
}

export type FeaturedBadge = {
  badge: RewardDetails;
  record: number;
  featured: boolean;
  assignedAt: string;
};

export function getFeaturedBadges(userId: number) {
  return fetchAPI<FeaturedBadge[]>({
    path: `/gamification/users/${userId}/featured`,
    method: 'get',
  });
}

export function setBadgeFeatured(code: string, featured: boolean) {
  return fetchAPI({
    path: `/gamification/badges/${code}/featured`,
    method: 'patch',
    body: { featured },
  });
}
