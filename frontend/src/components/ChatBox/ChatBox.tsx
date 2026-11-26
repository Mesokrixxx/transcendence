import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { sendMessage } from './Chats.services';
import { useChat } from './useChat';
import {
  Box,
  Title,
  MessageList,
  MessageItem,
  Author,
  Form,
  Input,
  SendButton,
  Placeholder,
  Notice,
} from './ChatBox.styles';

type SendError = 'rateLimit' | 'generic' | null;

type ChatBoxProps = {
  title: string;
  chatId?: number;
};

function ChatBox({ title, chatId }: ChatBoxProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { messages, isLoading, hasError, addMessage } = useChat(chatId);

  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<SendError>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Keep the latest message visible.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = draft.trim();
    if (chatId === undefined || text === '' || isSending) return;

    setIsSending(true);
    setSendError(null);

    sendMessage(chatId, text)
      .then((message) => {
        addMessage(message);
        setDraft('');
      })
      .catch((error: unknown) => {
        const isRateLimit =
          error instanceof Error &&
          error.message.startsWith('message rate limit');
        setSendError(isRateLimit ? 'rateLimit' : 'generic');
      })
      .finally(() => setIsSending(false));
  }

  let body: ReactNode;
  if (isLoading) {
    body = <Placeholder>{t('loadingMessages', { ns: 'chat' })}</Placeholder>;
  } else if (hasError) {
    body = (
      <Placeholder role="alert">
        {t('loadMessagesError', { ns: 'chat' })}
      </Placeholder>
    );
  } else if (messages.length === 0) {
    body = <Placeholder>{t('noMessagesYet', { ns: 'chat' })}</Placeholder>;
  } else {
    body = (
      <MessageList ref={listRef}>
        {messages.map((message) => (
          <MessageItem key={message.id}>
            <Author>
              {message.userId === user?.id
                ? t('you', { ns: 'common' })
                : message.username}
            </Author>
            <p>{message.content}</p>
          </MessageItem>
        ))}
      </MessageList>
    );
  }

  const canWrite = chatId !== undefined && !hasError;

  return (
    <Box>
      <Title>{title}</Title>

      {body}

      {sendError === 'rateLimit' && (
        <Notice $isError role="alert">
          {t('rateLimitError', { ns: 'chat' })}
        </Notice>
      )}
      {sendError === 'generic' && (
        <Notice $isError role="alert">
          {t('sendError', { ns: 'chat' })}
        </Notice>
      )}

      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setSendError(null);
          }}
          placeholder={t('writeAMessage', { ns: 'chat' })}
          aria-label={t('writeAMessage', { ns: 'chat' })}
          maxLength={2048}
          disabled={!canWrite}
        />
        <SendButton
          type="submit"
          disabled={!canWrite || isSending || draft.trim() === ''}
        >
          {t('send', { ns: 'common' })}
        </SendButton>
      </Form>
    </Box>
  );
}

export default ChatBox;
