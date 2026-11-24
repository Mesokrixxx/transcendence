import { useTranslation } from 'react-i18next';
import { GameResult, GameEndType, type Game } from '../../types/game';
import * as S from './History.styles';

interface HistoryProps {
  games: Game[];
  userId: number;
}

type EndTypeLabel =
  | 'checkmate'
  | 'forfeit'
  | 'timeForfeit'
  | 'stalemate'
  | 'insufficientMaterial'
  | 'threefoldRepetition'
  | 'fiftyMoveRule';

const gameEndTypes = {
  [GameEndType.CHECKMATE]: 'checkmate',
  [GameEndType.FORFEIT]: 'forfeit',
  [GameEndType.TIMEFORFEIT]: 'timeForfeit',
  [GameEndType.STALEMATE]: 'stalemate',
  [GameEndType.INSUFMATERIAL]: 'insufficientMaterial',
  [GameEndType.TRIPLEREPETITION]: 'threefoldRepetition',
  [GameEndType.FIFTYMOVE]: 'fiftyMoveRule',
} satisfies Record<GameEndType, EndTypeLabel>;

function History({ games, userId }: HistoryProps) {
  const { t } = useTranslation('statistics');

  const historyGames = games
    .filter((g) => g.whiteId === userId || g.blackId === userId)
    .sort((a, b) => {
      if (a.endedAt === null && b.endedAt === null)
        return b.createdAt.getTime() - a.createdAt.getTime();
      if (a.endedAt === null) return -1;
      if (b.endedAt === null) return 1;
      return b.endedAt.getTime() - a.endedAt.getTime();
    });

  return (
    <S.History>
      {historyGames.length === 0 ? (
        <S.EmptyHistory>{t('noGamesPlayed')}</S.EmptyHistory>
      ) : (
        historyGames.map((g) => {
          const isWhite = g.whiteId === userId;
          const opponent = isWhite ? g.black : g.white;
          const opponentName =
            opponent.profile?.displayName || opponent.username;
          const opponentElo = isWhite ? g.blackElo : g.whiteElo;

          const isOngoing = g.endedAt === null;
          const isDraw = g.result === GameResult.DRAW;
          const isWin =
            (isWhite && g.result === GameResult.WHITE) ||
            (!isWhite && g.result === GameResult.BLACK);

          const result = isOngoing
            ? 'ongoing'
            : isDraw
              ? 'draw'
              : isWin
                ? 'win'
                : 'loss';

          return (
            <S.GameEntry key={g.id}>
              <S.GameHeader>
                <S.GameResult $result={result}>{t(result)}</S.GameResult>
                <S.GameDate>{g.createdAt.toLocaleDateString()}</S.GameDate>
              </S.GameHeader>

              <S.GameOpponent>
                <S.OpponentName>{opponentName}</S.OpponentName>
                <S.OpponentElo>{opponentElo}</S.OpponentElo>
              </S.GameOpponent>

              <S.GameFooter>
                <S.GameColor>
                  {isWhite
                    ? t('white', { ns: 'chess' })
                    : t('black', { ns: 'chess' })}
                </S.GameColor>
                {!isOngoing && g.endType !== null && (
                  <S.GameEndType>
                    {t(gameEndTypes[g.endType], { ns: 'statistics' })}
                  </S.GameEndType>
                )}
                <S.GameArrow
                  to={`/watch/${g.id}`}
                  aria-label={t('watchGame', { ns: 'chess' })}
                >
                  →
                </S.GameArrow>
              </S.GameFooter>
            </S.GameEntry>
          );
        })
      )}
    </S.History>
  );
}

export default History;
