import { useTranslation } from 'react-i18next';
import { GameResult, type Game } from '../../../types/game';
import * as S from './FavoriteOpponentsStats.styles';

interface FavoriteOpponentsStatsProps {
  games: Game[];
  userId: number;
}

interface Opponent {
  id: number;
  username: string;
  wins: number;
  total: number;
}

function getFavoriteOpponents(
  userId: number,
  games: Game[],
  limit?: number,
): Opponent[] {
  const opponents = new Map<number, Opponent>();

  games.forEach((g) => {
    let opponentId: number;
    let opponentUsername: string;
    let isWhite = false;
    if (g.whiteId === userId) {
      opponentId = g.blackId;
      opponentUsername = g.black.profile?.displayName ?? g.black.username;
      isWhite = true;
    } else if (g.blackId === userId) {
      opponentId = g.whiteId;
      opponentUsername = g.white.profile?.displayName ?? g.white.username;
    } else return;
    if (g.result === null) return;
    const isWin =
      (isWhite && g.result === GameResult.WHITE) ||
      (!isWhite && g.result === GameResult.BLACK);
    let opponent = opponents.get(opponentId);
    if (!opponent) {
      opponent = {
        id: opponentId,
        username: opponentUsername,
        wins: 0,
        total: 0,
      };
      opponents.set(opponentId, opponent);
    }

    opponent.total++;
    if (isWin) opponent.wins++;
  });
  return [...opponents.values()]
    .sort((a, b) => b.total - a.total)
    .slice(0, limit ?? opponents.size);
}

function FavoriteOpponentsStats({
  games,
  userId,
}: FavoriteOpponentsStatsProps) {
  const { t } = useTranslation('statistics');

  const favoriteOpponents = getFavoriteOpponents(userId, games, 5);

  return (
    <S.FavoriteOpponentsStats>
      {favoriteOpponents.length > 0 ? (
        favoriteOpponents.map((o, i) => {
          const winRate = (o.wins / o.total) * 100;
          return (
            <S.Opponent key={o.id}>
              <S.Rank>{i + 1}</S.Rank>
              <S.Info>
                <S.Username>{o.username}</S.Username>
                <S.GamesPlayed>{t('gamesPlayed', { count: o.total })}</S.GamesPlayed>
              </S.Info>
              <S.WinRate>
                <S.Percentage>{winRate.toFixed(1)}%</S.Percentage>
                <S.WinRateLabel>{t('winRate')}</S.WinRateLabel>
              </S.WinRate>
            </S.Opponent>
          );
        })
      ) : (
        <S.InsufficientData>{t('noOpponentsAvailable')}</S.InsufficientData>
      )}
    </S.FavoriteOpponentsStats>
  );
}

export default FavoriteOpponentsStats;
