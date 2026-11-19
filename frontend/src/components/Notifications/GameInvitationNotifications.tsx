import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fetchAPI from '../../services/fetchAPI';
import realtimeSocket, { type RealtimeEvent } from '../../services/websocket';
import {
  NotificationLayer,
  NotificationCard,
  NotificationActions,
} from './GameInvitationNotifications.styles';

type Invitation = {
  id: number;
  sender: {
    id: number;
    username: string;
    profile: {
      avatar: string | null;
      displayName: string | null;
    } | null;
  };
};

export default function GameInvitationNotifications() {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [actionError, setActionError] = useState('');
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);

  async function loadInvitations() {
    const response = await fetchAPI<{ invitations: Invitation[] }>({
      path: '/games/invitations',
      method: 'get',
    });
    if (!response.error) setInvitations(response.result.invitations);
  }

  useEffect(() => {
    void loadInvitations();

    return realtimeSocket.subscribe((event: RealtimeEvent) => {
      if (event.type === 'game.invitation.received') {
        void loadInvitations();
      }
      if (
        event.type === 'game.invitation.accepted' &&
        typeof event.gameId === 'number'
      ) {
        navigate(`/play/${event.gameId}`);
      }
    });
  }, [navigate]);

  async function accept(invitationId: number) {
    setActionError('');
    setPendingActionId(invitationId);
    const response = await fetchAPI<{ gameId: number }>({
      path: `/games/invitations/${invitationId}/accept`,
      method: 'post',
    });
    setPendingActionId(null);
    if (response.error) {
      setActionError(
        typeof response.result === 'string'
          ? response.result
          : response.result.error,
      );
      return;
    }
    setInvitations((current) => current.filter((item) => item.id !== invitationId));
    navigate(`/play/${response.result.gameId}`);
  }

  async function decline(invitationId: number) {
    setActionError('');
    setPendingActionId(invitationId);
    const response = await fetchAPI<{ invitationId: number }>({
      path: `/games/invitations/${invitationId}/decline`,
      method: 'post',
    });
    setPendingActionId(null);
    if (response.error) {
      setActionError(
        typeof response.result === 'string'
          ? response.result
          : response.result.error,
      );
      return;
    }
    setInvitations((current) => current.filter((item) => item.id !== invitationId));
  }

  if (invitations.length === 0) return null;

  return (
    <NotificationLayer aria-live="polite">
      {invitations.map((invitation) => {
        const name =
          invitation.sender.profile?.displayName?.trim() ||
          invitation.sender.username;
        return (
          <NotificationCard key={invitation.id} role="alert">
            <p>{name} souhaite commencer une partie avec toi.</p>
            <NotificationActions>
              <button
                type="button"
                disabled={pendingActionId === invitation.id}
                onClick={() => void accept(invitation.id)}
              >
                {pendingActionId === invitation.id ? 'Traitement…' : 'Oui'}
              </button>
              <button
                type="button"
                disabled={pendingActionId === invitation.id}
                onClick={() => void decline(invitation.id)}
              >
                Non
              </button>
            </NotificationActions>
            {actionError && <p role="alert">{actionError}</p>}
          </NotificationCard>
        );
      })}
    </NotificationLayer>
  );
}
