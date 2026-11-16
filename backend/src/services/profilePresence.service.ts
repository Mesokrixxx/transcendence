import * as presenceService from './presence.service.js';

type ProfileChanged = {
  userId: number;
  username: string;
  avatar: string | null;
  firstName: string | null;
  lastName: string | null;
};

export async function broadcastProfileChanged(profile: ProfileChanged) {
  presenceService.broadcast({
    type: 'profile.changed',
    ...profile,
  });
}
