import { useState } from 'react';
import type {
  Board as BoardData,
  DeepReadonly,
  Move,
  Square as SquareName,
} from '../../../../chessgame/src/chessgame.types';
import { useTranslation } from 'react-i18next';
import { Board, Square, Piece, MoveIndicator } from './ChessBoard.styles';

type ChessBoardProps = {
  board?: DeepReadonly<BoardData>;
  selectedSquare?: SquareName | null;
  onSquareClick?: (square: SquareName) => void;
  disabled?: boolean;
  readOnly?: boolean;
  orientation?: 'white' | 'black';
  legalMoves?: DeepReadonly<Move[]>;
};

const backRow = [
  'rook',
  'knight',
  'bishop',
  'queen',
  'king',
  'bishop',
  'knight',
  'rook',
] as const;

function ChessBoard({
  board,
  selectedSquare,
  onSquareClick,
  disabled = false,
  readOnly = false,
  orientation = 'white',
  legalMoves = [],
}: ChessBoardProps) {
  const { t } = useTranslation();
  const [homeSelection, setHomeSelection] = useState<SquareName | null>(null);
  const selection =
    selectedSquare === undefined ? homeSelection : selectedSquare;

  function handleClick(square: SquareName) {
    if (disabled || readOnly) return;
    if (onSquareClick) onSquareClick(square);
    else setHomeSelection((selected) => (selected === square ? null : square));
  }

  return (
    <Board className="chessboard" aria-label={t('common:chessboard')}>
      {Array.from({ length: 64 }, (_, index) => {
        const row = Math.floor(index / 8);
        const column = index % 8;
        const file =
          orientation === 'white' ? 'abcdefgh'[column] : 'hgfedcba'[column];
        const rank = orientation === 'white' ? 8 - row : row + 1;
        const square = `${file}${rank}` as SquareName;
        const isLight = (row + column) % 2 === 0;
        let pieceFile = '';

        if (board) {
          const currentPiece = board[square];
          if (currentPiece)
            pieceFile = `${currentPiece.color}_${currentPiece.type}`;
        } else if (row === 0) {
          pieceFile = `black_${backRow[column]}`;
        } else if (row === 1) {
          pieceFile = 'black_pawn';
        } else if (row === 6) {
          pieceFile = 'white_pawn';
        } else if (row === 7) {
          pieceFile = `white_${backRow[column]}`;
        }

        let piece = null;
        let squareLabel = t('chess:emptySquare');
        if (pieceFile) {
          const color = pieceFile.split('_')[0];
          const pieceType = pieceFile.split('_')[1];
          squareLabel = t(
            `chess:pieceDescriptions.${color}${pieceType[0].toUpperCase()}${pieceType.slice(1)}`,
          );
          piece = (
            <Piece
              src={`/pieces/kosal/${pieceFile}.svg`}
              alt=""
              draggable={false}
            />
          );
        }

        const isLegalDestination =
          !readOnly &&
          !disabled &&
          legalMoves.some((move) => move.to === square);
        let isCapture = false;
        if (isLegalDestination && board && selection) {
          const selectedPiece = board[selection];
          if (board[square]) isCapture = true;
          else if (
            selectedPiece &&
            selectedPiece.type === 'pawn' &&
            selection[0] !== square[0]
          )
            isCapture = true;
        }
        if (isLegalDestination) {
          squareLabel += isCapture
            ? `, ${t('chess:legalCapture')}`
            : `, ${t('chess:legalMove')}`;
        }

        const isDisabled =
          disabled || readOnly || (!onSquareClick && pieceFile === '');
        return (
          <Square
            key={square}
            type="button"
            $isLight={isLight}
            $selected={!readOnly && selection === square}
            disabled={isDisabled}
            aria-label={t('chess:squareLabel', { square, squareLabel })}
            aria-pressed={!readOnly && selection === square}
            onClick={() => handleClick(square)}
          >
            {piece}
            {isLegalDestination && (
              <MoveIndicator $capture={isCapture} aria-hidden="true" />
            )}
          </Square>
        );
      })}
    </Board>
  );
}

export default ChessBoard;
