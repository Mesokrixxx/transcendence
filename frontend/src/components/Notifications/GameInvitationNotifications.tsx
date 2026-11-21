import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import fetchAPI from '../../services/fetchAPI';
import realtimeSocket, { type RealtimeEvent } from '../../services/websocket';
import {
  NotificationLayer,
  NotificationCard,
  PrivateMessageNotificationCard,
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

type DrawOffer = {
  id: number;
  gameId: number;
  sender: {
    id: number;
    username: string;
    profile: {
      avatar: string | null;
      displayName: string | null;
    } | null;
  };
};

type PrivateMessageNotification = {
  id: number;
  chatId: number;
  senderName: string;
  content: string;
};

export default function GameInvitationNotifications() {
  const navigate = useNavigate();
  const { t } = useTranslation('chess');
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [actionError, setActionError] = useState('');
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);
  const [drawOffers, setDrawOffers] = useState<DrawOffer[]>([]);
  const [privateMessages, setPrivateMessages] = useState<
    PrivateMessageNotification[]
  >([]);

  async function loadInvitations() {
    const response = await fetchAPI<{ invitations: Invitation[] }>({
      path: '/games/invitations',
      method: 'get',
    });
    if (!response.error) setInvitations(response.result.invitations);
  }

  async function loadDrawOffers() {
    const response = await fetchAPI<{ offers: DrawOffer[] }>({
      path: '/games/draw/offers',
      method: 'get',
    });
    if (!response.error) setDrawOffers(response.result.offers);
  }

  useEffect(() => {
    void loadInvitations();
    void loadDrawOffers();

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
      if (event.type === 'game.draw.received') {
        void loadDrawOffers();
      }
      if (
        event.type === 'game.draw.accepted' ||
        event.type === 'game.draw.declined'
      ) {
        void loadDrawOffers();
      }
      if (
        event.type === 'chat.message.received' &&
        typeof event.chatId === 'number' &&
        event.message &&
        typeof event.message === 'object'
      ) {
        const message = event.message as Record<string, unknown>;
        const sender = message.user;
        if (
          typeof message.id !== 'number' ||
          typeof message.content !== 'string' ||
          !sender ||
          typeof sender !== 'object'
        ) return;

        const senderData = sender as Record<string, unknown>;
        if (
          typeof senderData.username !== 'string' ||
          (senderData.profile !== null &&
            typeof senderData.profile !== 'object')
        ) return;

        const messageId = message.id;
        const content = message.content;
        const profile = senderData.profile as
          | { displayName?: unknown }
          | null;
        const senderName =
          typeof profile?.displayName === 'string' &&
          profile.displayName.trim() !== ''
            ? profile.displayName
            : senderData.username;

        setPrivateMessages((current) => [
          ...current.filter((item) => item.id !== messageId),
          {
            id: messageId,
            chatId: event.chatId as number,
            senderName,
            content,
          },
        ]);
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

  async function acceptDrawOffer(offer: DrawOffer) {
    setActionError('');
    setPendingActionId(offer.id);
    const response = await fetchAPI({
      path: `/games/${offer.gameId}/draw/accept`,
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
    setDrawOffers((current) => current.filter((item) => item.id !== offer.id));
  }

  async function declineDrawOffer(offer: DrawOffer) {
    setActionError('');
    setPendingActionId(offer.id);
    const response = await fetchAPI({
      path: `/games/${offer.gameId}/draw/decline`,
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
    setDrawOffers((current) => current.filter((item) => item.id !== offer.id));
  }

  if (
    invitations.length === 0 &&
    drawOffers.length === 0 &&
    privateMessages.length === 0
  ) return null;

  return (
    <NotificationLayer aria-live="polite">
      {invitations.map((invitation) => {
        const name =
          invitation.sender.profile?.displayName?.trim() ||
          invitation.sender.username;
        return (
          <NotificationCard key={invitation.id} role="alert">
            <p>{t('invitations.gameRequest', { name })}</p>
            <NotificationActions>
              <button
                type="button"
                disabled={pendingActionId === invitation.id}
                onClick={() => void accept(invitation.id)}
              >
                {pendingActionId === invitation.id
                  ? t('processing', { ns: 'common' })
                  : t('yes', { ns: 'common' })}
              </button>
              <button
                type="button"
                disabled={pendingActionId === invitation.id}
                onClick={() => void decline(invitation.id)}
              >
                {t('no', { ns: 'common' })}
              </button>
            </NotificationActions>
            {actionError && <p role="alert">{actionError}</p>}
          </NotificationCard>
        );
      })}
      {drawOffers.map((offer) => {
        const name =
          offer.sender.profile?.displayName?.trim() ||
          offer.sender.username;
        return (
          <NotificationCard key={`draw-${offer.id}`} role="alert">
            <p>{t('invitations.drawOffer', { name })}</p>
            <NotificationActions>
              <button
                type="button"
                disabled={pendingActionId === offer.id}
                onClick={() => void acceptDrawOffer(offer)}
              >
                {t('yes', { ns: 'common' })}
              </button>
              <button
                type="button"
                disabled={pendingActionId === offer.id}
                onClick={() => void declineDrawOffer(offer)}
              >
                {t('no', { ns: 'common' })}
              </button>
            </NotificationActions>
          </NotificationCard>
        );
      })}
      {privateMessages.map((message) => (
        <PrivateMessageNotificationCard
          key={`message-${message.id}`}
          role="alert"
          onAnimationEnd={(event) => {
            if (event.animationName !== 'notification-fade') return;
            setPrivateMessages((current) =>
              current.filter((item) => item.id !== message.id),
            );
          }}
        >
          <p>
            <strong>{message.senderName}</strong> t&apos;a envoyé un message
            privé.
          </p>
          <p>{message.content}</p>
          <NotificationActions>
            <button
              type="button"
              onClick={() => {
                setPrivateMessages((current) =>
                  current.filter((item) => item.id !== message.id),
                );
                navigate('/chat');
              }}
            >
              Ouvrir les messages
            </button>
            <button
              type="button"
              onClick={() =>
                setPrivateMessages((current) =>
                  current.filter((item) => item.id !== message.id),
                )
              }
            >
              Fermer
            </button>
          </NotificationActions>
        </PrivateMessageNotificationCard>
      ))}
      {actionError && <p role="alert">{actionError}</p>}
    </NotificationLayer>
  );
}
