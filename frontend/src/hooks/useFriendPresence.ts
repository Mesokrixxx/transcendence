import { useEffect, useState } from 'react';
import realtimeSocket, { type RealtimeEvent } from '../services/websocket';

export function useFriendPresence(enabled = true) {
  const [presence, setPresence] = useState(() => new Map<number, boolean>());

  useEffect(() => {
    if (!enabled) return;

    function updatePresence(event: RealtimeEvent) {
      if (event.type === 'presence.snapshot' && Array.isArray(event.users)) {
        const next = new Map<number, boolean>();
        const users: unknown[] = event.users;
        for (const user of users) {
          if (
            user &&
            typeof user === 'object' &&
            'userId' in user &&
            'online' in user &&
            typeof user.userId === 'number' &&
            typeof user.online === 'boolean'
          ) {
            next.set(user.userId, user.online);
          }
        }
        setPresence(next);
        return;
      }

      if (
        event.type === 'presence.changed' &&
        typeof event.userId === 'number' &&
        typeof event.online === 'boolean'
      ) {
        const { userId, online } = event;
        setPresence((current) => new Map(current).set(userId, online));
      }

      if (
        (event.type === 'friend.changed' || event.type === 'friend.blocked') &&
        typeof event.userId === 'number'
      ) {
        const { userId } = event;
        setPresence((current) => {
          if (!current.has(userId)) return current;
          const next = new Map(current);
          next.delete(userId);
          return next;
        });
      }
    }

    return realtimeSocket.subscribe(updatePresence);
  }, [enabled]);

  return presence;
}
