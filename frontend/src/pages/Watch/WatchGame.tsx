import { useState } from 'react';
import ChessGame from '../../../../chessgame/src/chessgame';
import type { Move } from '../../../../chessgame/src/chessgame.types';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ChessBoard from '../../components/ChessBoard/ChessBoard';
import Avatar from '../../components/Avatar/Avatar';
import GameStatus from '../../components/GameStatus/GameStatus';
import ChatBox from '../../components/ChatBox/ChatBox';
import Button from '../../components/Button/Button';
import { Page } from '../Home/Home.styles';
import {
  PlayContent as WatchContent,
  GameArea,
  GameInfo,
  GameChat,
} from '../Play/Play.styles';
import { useTranslation } from 'react-i18next';

// en attendant les donnees du back
const demoMoves: Move[] = [
  // { from: 'e2', to: 'e4'},
  // { from: 'e7', to: 'e5'},
  // { from: 'g1', to: 'f3'},
  // { from: 'b8', to: 'c6'},
];

function Watch() {
  const { t } = useTranslation();
  const [game] = useState(() => new ChessGame(demoMoves));
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');

  function flipBoard() {
    if (orientation === 'white') {
      setOrientation('black');
    } else {
      setOrientation('white');
    }
  }

  return (
    <Page>
      <Navbar />

      <WatchContent className="container">
        <GameArea aria-label={t('chess:demoGameForSpectators')}>
          <GameInfo aria-label={t('chess:gameInformation')}>
            <div className="opponent">
              <Avatar username={t('chess:playerWhite')} size={48} />
              <span>{t('chess:playerWhite')}</span>
            </div>

            <div className="opponent">
              <Avatar username={t('chess:playerBlack')} size={48} />
              <span>{t('chess:playerBlack')}</span>
            </div>

            <p>{t('chess:demoGame')}</p>

            <Button variant="secondary" onClick={flipBoard}>
              {t('chess:flipBoard')}
            </Button>

            <GameStatus game={game} />
          </GameInfo>

          <ChessBoard
            board={game.getBoard()}
            orientation={orientation}
            readOnly
          />

          <GameChat aria-label={t('chat:spectatorChat')}>
            <ChatBox title={t('chat:spectatorChat')} />
          </GameChat>
        </GameArea>
      </WatchContent>

      <Footer />
    </Page>
  );
}
export default Watch;
