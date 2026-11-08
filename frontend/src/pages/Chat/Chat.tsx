import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { Page } from '../Home/Home.styles';
import { Content } from './Chat.styles';
import Messaging from './Messaging';

function Chat() {
  const { t } = useTranslation('chat');

  return (
    <Page>
      <Navbar />

      <Content className="container">
        <h1>{t('messages')}</h1>
        <Messaging />
      </Content>

      <Footer />
    </Page>
  );
}

export default Chat;