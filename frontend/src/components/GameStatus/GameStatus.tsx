import type ChessGame from '../../../../chessgame/src/chessgame';
import { useTranslation } from 'react-i18next';
import { StatusBox } from './GameStatus.styles';

type GameStatusProps = { game: ChessGame };

function GameStatus({ game }: GameStatusProps) {
  const { t } = useTranslation();
  const currentColor =
    game.getTurn() === 'white'
      ? t('white', { ns: 'chess' })
      : t('black', { ns: 'chess' });
  const winner =
    game.getTurn() === 'white'
      ? t('black', { ns: 'chess' })
      : t('white', { ns: 'chess' });

  let status: string;
  if (game.isCheckmate()) {
    status = t('checkmateWinner', { ns: 'chess', winner });
  } else if (game.isDraw()) {
    status = t('drawStatus', { ns: 'chess' });
  } else {
    status = t('toMove', { ns: 'chess', color: currentColor });
    if (game.isCheck())
      status = t('checkStatus', { ns: 'chess', turnStatus: status });
  }

  return <StatusBox role="status">{status}</StatusBox>;
}

export default GameStatus;
