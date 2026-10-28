import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ChessBoard from '../../components/ChessBoard/ChessBoard';
import Button from '../../components/Button/Button';
import { Page, Content, Intro, Aside } from './../Home/Home.styles';
import { useTranslation, Trans } from 'react-i18next';

function Home() {
  const { t } = useTranslation();
  return (
    <Page>
      <Navbar />

      <Content className="container">
        <Intro>
          <h1>
            <Trans i18nKey="home:heroTitle">
              Make your <span>move!</span>
            </Trans>
          </h1>
          <Button to="/play" variant="accent">
            {t('home:getStarted')}
          </Button>
        </Intro>

        <ChessBoard />

        <Aside />
      </Content>

      <Footer />
    </Page>
  );
}

export default Home;
