import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Avatar from '../../components/Avatar/Avatar';
import ChatBox from '../../components/ChatBox/ChatBox';
import { getFriends, type FriendUser } from '../../services/friends';
import fetchAPI from '../../services/fetchAPI';
import { ChatLayout, ConversationList, ConversationButton, ConversationPanel } from './Chat.styles';

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
        setSelectedId((current) => current ?? results[0]?.id ?? null);
      } catch {
        if (active) setError(t('requestFailed', { ns: 'common' }));
      }
    }

    void loadConversations();
    return () => {
      active = false;
    };
  }, [t]);

  if (error) return <p role="alert">{error}</p>;

  return (
    <ChatLayout>
      <ConversationList aria-labelledby={`${id}-conversations`}>
        <h2 id={`${id}-conversations`}>
          {t('conversations')}
        </h2>

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
                  src={conversation.avatar}
                  username={conversation.username}
                  isOnline={conversation.isOnline}
                  size={40}
                />
                <span>{conversation.username}</span>
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
          <ChatBox title={conversation.username} chatId={conversation.chatId} />
        </ConversationPanel>
      ))}
    </ChatLayout>
  );
}

export default Messaging;