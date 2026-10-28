import type ChessGame from '../../../../chessgame/src/chessgame';
import { useTranslation } from 'react-i18next';
import { StatusBox } from './GameStatus.styles';

type GameStatusProps = { game: ChessGame };

function GameStatus({ game }: GameStatusProps) {
  const { t } = useTranslation();
  const currentColor =
    game.getTurn() === 'white' ? t('chess:white') : t('chess:black');
  const winner =
    game.getTurn() === 'white' ? t('chess:black') : t('chess:white');

  let status: string;
  if (game.isCheckmate()) {
    status = t('chess:checkmateWinner', { winner });
  } else if (game.isDraw()) {
    status = t('chess:drawStatus');
  } else {
    status = t('chess:toMove', { color: currentColor });
    if (game.isCheck()) status = t('chess:checkStatus', { turnStatus: status });
  }

  return <StatusBox role="status">{status}</StatusBox>;
}

export default GameStatus;
