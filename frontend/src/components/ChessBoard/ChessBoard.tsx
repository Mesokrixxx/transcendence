import { useState } from 'react'
import { Board, Square, Piece } from './ChessBoard.styles'

const backRow = [
  'rook',
  'knight',
  'bishop',
  'queen',
  'king',
  'bishop',
  'knight',
  'rook',
]

function ChessBoard() {
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null)

  function selectPiece(index: number) {
    if (selectedSquare === index) {
      setSelectedSquare(null)
    } else {
      setSelectedSquare(index)
    }
  }

  return (
    <Board className="chessboard" aria-label="Chessboard">
      {Array.from({ length: 64 }, (_, index) => {
        const row = Math.floor(index / 8)
        const column = index % 8

        let isLight = false

        if ((row + column) % 2 === 0) {
          isLight = true
        }

        let pieceFile = ''

        if (row === 0) {
          pieceFile = 'black_' + backRow[column]
        } else if (row === 1) {
          pieceFile = 'black_pawn'
        } else if (row === 6) {
          pieceFile = 'white_pawn'
        } else if (row === 7) {
          pieceFile = 'white_' + backRow[column]
        }

        let piece = null
        let squareLabel = 'Empty square'

        if (pieceFile !== '') {
          squareLabel = pieceFile.replace('_', ' ')

          piece = (
            <Piece
              src={'/pieces/kosal/' + pieceFile + '.svg'}
              alt=""
              draggable={true}
            />
          )
        }

        return (
          <Square
            key={index}
            type="button"
            $isLight={isLight}
            $selected={selectedSquare === index}
            disabled={pieceFile === ''}
            aria-label={squareLabel}
            aria-pressed={selectedSquare === index}
            onClick={() => selectPiece(index)}
          >
            {piece}
          </Square>
        )
      })}
    </Board>
  )
}

export default ChessBoard