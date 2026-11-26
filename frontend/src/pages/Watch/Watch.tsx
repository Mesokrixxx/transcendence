import { useEffect, useState } from 'react';
import ChessGame from '../../../../chessgame/src/chessgame';
import type { Move } from '../../../../chessgame/src/chessgame.types';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { Page } from '../Home/Home.styles';
import ChessBoard from '../../components/ChessBoard/ChessBoard';
import Button from '../../components/Button/Button';
import { GameList, GameRow, MiniBoard } from './Watch.styles';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import fetchAPI from '../../services/fetchAPI';

type WatchPlayer = {
  id: number;
  username: string;
  displayName?: string | null;
  avatar: string | null;
};

type WatchGame = {
  id: number;
  status: 'WAITING' | 'PLAYING';
  moves: Move[];
  whiteId: number;
  blackId: number;
  white: WatchPlayer;
  black: WatchPlayer;
  isPlayer: boolean;
};

function isWatchGame(value: unknown): value is WatchGame {
  if (!value || typeof value !== 'object') return false;
  const game = value as Partial<WatchGame>;
  return (
    typeof game.id === 'number' &&
    (game.status === 'WAITING' || game.status === 'PLAYING') &&
    Array.isArray(game.moves) &&
    typeof game.whiteId === 'number' &&
    typeof game.blackId === 'number' &&
    typeof game.isPlayer === 'boolean'
  );
}

function Watch() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [games, setGames] = useState<WatchGame[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadGames() {
      const response = await fetchAPI<{ games: WatchGame[] }>({
        path: '/games',
        method: 'get',
      });
      if (!active) return;
      if (response.error) {
        setError(t('unableToLoadGames', { ns: 'chess' }));
        return;
      }
      setGames(response.result.games.filter(isWatchGame));
      setError('');
    }

    void loadGames();
    const interval = window.setInterval(() => void loadGames(), 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [t]);

  return (
    <Page>
      <Navbar />
      <main className="container">
        <h1>{t('gameInProgress', { ns: 'chess' })}</h1>

        {error && <p role="alert">{error}</p>}
        {games.length === 0 && !error && (
          <p role="status">{t('noGamesInProgress', { ns: 'chess' })}</p>
        )}

        <GameList>
          {games.map((activeGame) => {
            const chessGame = new ChessGame(activeGame.moves);
            const whiteName =
              activeGame.white.displayName?.trim() || activeGame.white.username;
            const blackName =
              activeGame.black.displayName?.trim() || activeGame.black.username;
            const isOwnGame =
              activeGame.isPlayer ||
              activeGame.whiteId === user?.id ||
              activeGame.blackId === user?.id;

            return (
              <GameRow key={activeGame.id}>
                <MiniBoard>
                  <ChessBoard board={chessGame.getBoard()} readOnly />
                </MiniBoard>

                <div>
                  <h2>
                    {t('versus', {
                      ns: 'chess',
                      white: whiteName,
                      black: blackName,
                    })}
                  </h2>
                  <p>
                    {activeGame.status === 'PLAYING'
                      ? t('gameInProgress', { ns: 'chess' })
                      : t('waitingForFriend', { ns: 'chess' })}
                  </p>
                  {isOwnGame && <p>{t('yourGame', { ns: 'chess' })}</p>}
                </div>

                <Button
                  to={
                    isOwnGame
                      ? `/play/${activeGame.id}`
                      : `/watch/${activeGame.id}`
                  }
                >
                  {isOwnGame
                    ? t('joinGame', { ns: 'chess' })
                    : t('watchGame', { ns: 'chess' })}
                </Button>
              </GameRow>
            );
          })}
        </GameList>
      </main>
      <Footer />
    </Page>
  );
}
export default Watch;
