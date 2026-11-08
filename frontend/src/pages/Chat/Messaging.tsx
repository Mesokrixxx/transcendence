import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Avatar from '../../components/Avatar/Avatar';
import ChatBox from '../../components/ChatBox/ChatBox';
import { ChatLayout, ConversationList, ConversationButton, ConversationPanel } from './Chat.styles';

const conversations = [
  { id: 'noa', username: 'Noa' },
  { id: 'dylan', username: 'Dylan' },
  { id: 'adam', username: 'Adam' },
];

function Messaging() {
  const { t } = useTranslation('chat');
  const [selectedId, setSelectedId] = useState(conversations[0].id);
  const id = useId();

  return (
    <ChatLayout>
      <ConversationList aria-labelledby={`${id}-conversations`}>
        <h2 id={`${id}-conversations`}>
          {t('conversations')}
        </h2>

        <ul>
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <ConversationButton
                type="button"
                aria-pressed={selectedId === conversation.id}
                aria-controls={`${id}-${conversation.id}`}
                onClick={() => setSelectedId(conversation.id)}
              >
                <Avatar username={conversation.username} size={40} />
                <span>{conversation.username}</span>
              </ConversationButton>
            </li>
          ))}
        </ul>
      </ConversationList>

      {conversations.map((conversation) => (
        <ConversationPanel
          key={conversation.id}
          id={`${id}-${conversation.id}`}
          hidden={selectedId !== conversation.id}
        >
          <ChatBox title={conversation.username} />
        </ConversationPanel>
      ))}
    </ChatLayout>
  );
}

export default Messaging;