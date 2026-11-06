import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ChatBox from '../../components/ChatBox/ChatBox';
import { Page } from '../Home/Home.styles';
import { Content, Boxes } from './Chat.styles';
import { useTranslation } from 'react-i18next';

const playerMessages = [
  { id: 1, author: 'alice', content: 'Good luck!' },
  { id: 2, author: 'bob', content: 'You too, have fun.' },
];

const spectatorMessages = [
  { id: 1, author: 'charlie', content: 'Nice opening!' },
];

function Chat() {
  const { t } = useTranslation();
  return (
    <Page>
      <Navbar />

      <Content className="container">
        <h1>{t('chat', { ns: 'chat' })}</h1>

        <Boxes>
          <ChatBox
            title={t('players', { ns: 'chat' })}
            initialMessages={playerMessages}
          />
          <ChatBox
            title={t('spectators', { ns: 'chat' })}
            initialMessages={spectatorMessages}
          />
        </Boxes>
      </Content>

      <Footer />
    </Page>
  );
}

export default Chat;
