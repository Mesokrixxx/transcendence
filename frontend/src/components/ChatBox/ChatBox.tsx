import { useEffect, useState, type FormEvent } from 'react';
import {
  Box,
  Title,
  MessageList,
  MessageItem,
  Author,
  Form,
  Input,
  SendButton,
} from './ChatBox.styles';
import { useTranslation } from 'react-i18next';
import fetchAPI from '../../services/fetchAPI';
import realtimeSocket, { type RealtimeEvent } from '../../services/websocket';
import { useAuth } from '../../context/AuthContext';

type Message = {
  id: number;
  author: string;
  content: string;
};

type ChatMessage = {
  id: number;
  content: string;
  userId: number;
  user: {
    id: number;
    username: string;
  };
};

type ChatBoxProps = {
  title: string;
  initialMessages?: Message[];
  chatId?: number;
};

function ChatBox({ title, initialMessages = [], chatId }: ChatBoxProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');

  function toMessage(message: ChatMessage): Message {
    return {
      id: message.id,
      author: message.userId === user?.id ? 'me' : message.user.username,
      content: message.content,
    };
  }

  function appendMessage(message: ChatMessage) {
    setMessages((current) => {
      if (current.some((item) => item.id === message.id)) return current;
      return [...current, toMessage(message)];
    });
  }

  useEffect(() => {
    if (chatId === undefined) {
      setMessages(initialMessages);
      return;
    }

    let active = true;
    setError('');
    fetchAPI<{ messages: ChatMessage[] }>({
      path: `/chats/${chatId}`,
      method: 'get',
    }).then((response) => {
      if (!active) return;
      if (response.error) {
        setError(t('requestFailed', { ns: 'common' }));
        return;
      }
      setMessages(response.result.messages.map(toMessage));
    });

    const handleEvent = (event: RealtimeEvent) => {
      if (event.type !== 'chat.message' || event.chatId !== chatId) return;
      const message = event.message;
      if (!message || typeof message !== 'object') return;
      if (
        !('id' in message) ||
        !('content' in message) ||
        !('userId' in message) ||
        !('user' in message) ||
        typeof message.id !== 'number' ||
        typeof message.content !== 'string' ||
        typeof message.userId !== 'number' ||
        !message.user ||
        typeof message.user !== 'object' ||
        !('id' in message.user) ||
        !('username' in message.user) ||
        typeof message.user.id !== 'number' ||
        typeof message.user.username !== 'string'
      ) {
        return;
      }
      appendMessage({
        id: message.id,
        content: message.content,
        userId: message.userId,
        user: {
          id: message.user.id,
          username: message.user.username,
        },
      });
    };

    const leaveChat = realtimeSocket.joinChat(chatId, handleEvent);
    return () => {
      active = false;
      leaveChat();
    };
  }, [chatId, t, user?.id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = draft.trim();
    if (text === '') return;

    if (chatId !== undefined) {
      const response = await fetchAPI<ChatMessage>({
        path: `/chats/${chatId}`,
        method: 'put',
        body: { message: text },
      });
      if (response.error) {
        setError(t('requestFailed', { ns: 'common' }));
        return;
      }
      appendMessage(response.result);
      setDraft('');
      setError('');
      return;
    }

    const newMessage: Message = { id: Date.now(), author: 'me', content: text };
    setMessages([...messages, newMessage]);
    setDraft('');
  }

  return (
    <Box>
      <Title>{title}</Title>

      {error && <p role="alert">{error}</p>}

      <MessageList>
        {messages.map((message) => (
          <MessageItem key={message.id}>
            <Author>
              {message.author === 'me' ? t('you', { ns: 'common' }) : message.author}
            </Author>
            <p>{message.content}</p>
          </MessageItem>
        ))}
      </MessageList>

      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={t('writeAMessage', { ns: 'chat' })}
        />
        <SendButton type="submit">{t('send', { ns: 'common' })}</SendButton>
      </Form>
    </Box>
  );
}

export default ChatBox;
