import { useState } from 'react';
import ChessGame from '../../../../chessgame/src/chessgame';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { Page } from '../Home/Home.styles';
import ChessBoard from '../../components/ChessBoard/ChessBoard';
import Button from '../../components/Button/Button';
import { GameList, GameRow, MiniBoard } from './Watch.styles';
import { useTranslation } from 'react-i18next';

function Watch() {
  const { t } = useTranslation();
  const [game] = useState(() => new ChessGame());
  return (
    <Page>
      <Navbar />
      <main className="container">
        <h1>{t('gameInProgress', { ns: 'chess' })}</h1>

        <GameList>
          <GameRow>
            <MiniBoard>
              <ChessBoard board={game.getBoard()} readOnly />
            </MiniBoard>

            <div>
              <h2>{t('playerWhiteVsPlayerBlack', { ns: 'chess' })}</h2>
              <p>{t('demoGame', { ns: 'chess' })}</p>
            </div>

            <Button to="/watch/1">{t('watchGame', { ns: 'chess' })}</Button>
          </GameRow>
        </GameList>
      </main>
      <Footer />
    </Page>
  );
}
export default Watch;
