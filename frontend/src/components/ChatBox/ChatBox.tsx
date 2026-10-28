import { useState, type FormEvent } from 'react';
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

type Message = {
  id: number;
  author: string;
  content: string;
};

type ChatBoxProps = {
  title: string;
  initialMessages?: Message[];
};

function ChatBox({ title, initialMessages = [] }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = draft.trim();
    if (text === '') return;

    const newMessage: Message = { id: Date.now(), author: 'me', content: text };
    setMessages([...messages, newMessage]);
    setDraft('');
  }

  return (
    <Box>
      <Title>{title}</Title>

      <MessageList>
        {messages.map((message) => (
          <MessageItem key={message.id}>
            <Author>{message.author}</Author>
            <p>{message.content}</p>
          </MessageItem>
        ))}
      </MessageList>

      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write a message..."
        />
        <SendButton type="submit">Send</SendButton>
      </Form>
    </Box>
  );
}

export default ChatBox;
