import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Avatar from '../../components/Avatar/Avatar';
import ChatBox from '../../components/ChatBox/ChatBox';
import { getFriends, type FriendUser } from '../../services/friends';
import fetchAPI from '../../services/fetchAPI';
import realtimeSocket, { type RealtimeEvent } from '../../services/websocket';
import {
  ChatLayout,
  ConversationList,
  ConversationButton,
  ConversationPanel,
} from './Chat.styles';

type Conversation = FriendUser & { chatId: number };

function Messaging() {
  const { t } = useTranslation('chat');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const id = useId();

  useEffect(() => {
    let active = true;

    async function loadConversations() {
      try {
        const { friends } = await getFriends();
        const results = await Promise.all(
          friends.map(async (friend) => {
            const response = await fetchAPI<{ id: number }>({
              path: '/chats',
              method: 'post',
              body: { userId: friend.id },
            });
            if (response.error) throw new Error('Unable to create chat');
            return { ...friend, chatId: response.result.id };
          }),
        );

        if (!active) return;
        setConversations(results);
        setSelectedId((current) => current ?? results[0]?.chatId ?? null);
      } catch {
        if (active) setError(t('requestFailed', { ns: 'common' }));
      }
    }

    void loadConversations();
    return () => {
      active = false;
    };
  }, [t]);

  // Live online status: the initial value comes from getFriends(),
  // then we follow presence.changed events from the shared socket.
  useEffect(() => {
    function updatePresence(event: RealtimeEvent) {
      if (
        event.type !== 'presence.changed' ||
        typeof event.userId !== 'number' ||
        typeof event.online !== 'boolean'
      )
        return;

      const userId = event.userId;
      const online = event.online;

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === userId
            ? { ...conversation, isOnline: online }
            : conversation,
        ),
      );
    }

    return realtimeSocket.subscribe(updatePresence);
  }, []);

  useEffect(() => {
    function updateConversations(event: RealtimeEvent) {
      if (
        event.type === 'friend.request.accepted' ||
        event.type === 'friend.changed' ||
        event.type === 'friend.blocked' ||
        event.type === 'friend.unblocked'
      ) {
        void getFriends()
          .then(async ({ friends }) => {
            const results = await Promise.all(
              friends.map(async (friend) => {
                const response = await fetchAPI<{ id: number }>({
                  path: '/chats',
                  method: 'post',
                  body: { userId: friend.id },
                });
                if (response.error) throw new Error('Unable to create chat');
                return { ...friend, chatId: response.result.id };
              }),
            );
            setConversations(results);
          })
          .catch(() => setError(t('requestFailed', { ns: 'common' })));
        return;
      }

      if (
        event.type !== 'profile.changed' ||
        typeof event.userId !== 'number' ||
        typeof event.username !== 'string' ||
        (event.avatar !== null && typeof event.avatar !== 'string')
      )
        return;

      const displayName =
        typeof event.displayName === 'string'
          ? event.displayName
          : event.displayName === null
            ? null
            : undefined;
      const username = event.username;
      const avatar = event.avatar ?? undefined;

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === event.userId
            ? {
                ...conversation,
                username,
                displayName,
                avatar,
              }
            : conversation,
        ),
      );
    }

    return realtimeSocket.subscribe(updateConversations);
  }, [t]);

  if (error) return <p role="alert">{error}</p>;

  return (
    <ChatLayout>
      <ConversationList aria-labelledby={`${id}-conversations`}>
        <h2 id={`${id}-conversations`}>{t('conversations')}</h2>

        <ul>
          {conversations.map((conversation) => (
            <li key={conversation.chatId}>
              <ConversationButton
                type="button"
                aria-pressed={selectedId === conversation.chatId}
                aria-controls={`${id}-${conversation.chatId}`}
                onClick={() => setSelectedId(conversation.chatId)}
              >
                <Avatar
                  src={conversation.avatar || '/avatars/default.svg'}
                  username={conversation.username}
                  isOnline={conversation.isOnline}
                  size={40}
                />
                <span>
                  {conversation.displayName?.trim() || conversation.username}
                </span>
              </ConversationButton>
            </li>
          ))}
        </ul>
        {conversations.length === 0 && <p>{t('noConversations')}</p>}
      </ConversationList>

      {conversations.map((conversation) => (
        <ConversationPanel
          key={conversation.chatId}
          id={`${id}-${conversation.chatId}`}
          hidden={selectedId !== conversation.chatId}
        >
          <ChatBox
            title={conversation.displayName?.trim() || conversation.username}
            chatId={conversation.chatId}
          />
        </ConversationPanel>
      ))}
    </ChatLayout>
  );
}

export default Messaging;
