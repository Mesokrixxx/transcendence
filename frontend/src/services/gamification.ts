import fetchAPI from './fetchAPI';

type RewardDetails = {
  id: number;
  code: string;
  name: string;
  description: string;
};

export type GamificationProgress = {
  achievements: {
    achievement: RewardDetails;
    unlockedAt: string;
  }[];
  badges: {
    badge: RewardDetails;
    record: number;
    featured: boolean;
    assignedAt: string;
  }[];
};

export function getMyProgress() {
  return fetchAPI<GamificationProgress>({
    path: '/gamification/me',
    method: 'get',
  });
}