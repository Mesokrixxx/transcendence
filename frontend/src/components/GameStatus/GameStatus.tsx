import type ChessGame from '../../../../chessgame/src/chessgame';
import { StatusBox } from './GameStatus.styles';

type GameStatusProps = {
  game: ChessGame;
};

function GameStatus({ game }: GameStatusProps) {
  let currentColor;
  let winner;

  if (game.getTurn() === 'white') {
    currentColor = 'White';
    winner = 'Black';
  } else {
    currentColor = 'Black';
    winner = 'White';
  }

  let status = currentColor + ' to move';

  if (game.isCheckmate()) {
    status = 'Chekmate - ' + winner + 'wins';
  } else if (game.isDraw()) {
    status = 'Draw';
  } else if (game.isCheck()) {
    status += ' - Check';
  }

  return <StatusBox role="status">{status}</StatusBox>;
}

export default GameStatus;
