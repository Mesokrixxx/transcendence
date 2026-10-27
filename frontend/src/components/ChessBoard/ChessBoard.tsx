import { useState } from 'react'
import type {
    Board as BoardData,
    DeepReadonly,
    Move,
    Square as SquareName
} from '../../../../chessgame/src/chessgame.types'
import { Board, Square, Piece, MoveIndicator } from './ChessBoard.styles'

type ChessBoardProps = {
    board?: DeepReadonly<BoardData>
    selectedSquare?: SquareName | null
    onSquareClick?: (square: SquareName) => void
    disabled?: boolean
    readOnly?: boolean
    orientation?: 'white' | 'black'
    legalMoves?: DeepReadonly<Move[]>
}

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

function ChessBoard({
    board,
    selectedSquare,
    onSquareClick,
    disabled = false,
    readOnly = false,
    orientation = 'white',
    legalMoves = []
}: ChessBoardProps) {
    const [homeSelection, setHomeSelection] =
        useState<SquareName | null>(null)

    let selection

    if (selectedSquare === undefined) {
        selection = homeSelection
    } else {
        selection = selectedSquare
    }
    
    function handleClick(square: SquareName) {
        if (disabled || readOnly) return

        if (onSquareClick) {
            onSquareClick(square)
        } else if (homeSelection === square) {
            setHomeSelection(null)
        } else {
            setHomeSelection(square)
        }
    }

    return (
        <Board className="chessboard" aria-label="Chessboard">
            {Array.from({ length: 64 }, (_, index) => {
                const row = Math.floor(index / 8)
                const column = index % 8

                const file = orientation === 'white' ? 'abcdefgh'[column]: 'hgfedcba'[column]

                const rank = orientation === 'white' ? 8- row : row +1
                const square = `${file}${rank}` as SquareName

                const isLight = (row + column) % 2 === 0
                let pieceFile = ''

                if (board) {
                    const currentPiece = board[square]

                    if (currentPiece) {
                        pieceFile =
                            `${currentPiece.color}_${currentPiece.type}`
                    }
                } else {

                    if (row === 0) {
                        pieceFile = 'black_' + backRow[column]
                    } else if (row === 1) {
                        pieceFile = 'black_pawn'
                    } else if (row === 6) {
                        pieceFile = 'white_pawn'
                    } else if (row === 7) {
                        pieceFile = 'white_' + backRow[column]
                    }
                }

                let piece = null
                let squareLabel = 'Empty square'

                if (pieceFile !== '') {
                    squareLabel = pieceFile.replace('_', ' ')

                    piece = (
                        <Piece
                            src={'/pieces/kosal/' + pieceFile + '.svg'}
                            alt=""
                            draggable={false}
                        />
                    )
                }
                const isLegalDestination =
                    !readOnly &&
                    !disabled &&
                    legalMoves.some((move) => move.to === square)

                let isCapture = false

                if (isLegalDestination && board && selection) {
                    const selectedPiece = board[selection]

                    if (board[square]) {
                        isCapture = true
                    } else if (
                        selectedPiece &&
                        selectedPiece.type === 'pawn' &&
                        selection[0] !== square[0]
                    ) {
                        // Prise en passant.
                        isCapture = true
                    }
                }

                if (isLegalDestination) {
                    if (isCapture) {
                        squareLabel += ' — legal capture'
                    } else {
                        squareLabel += ' — legal move'
                    }
                }

                const isDisabled =
                    disabled ||
                    readOnly ||
                    (!onSquareClick && pieceFile === '')

                return (
                    <Square
                        key={square}
                        type="button"
                        $isLight={isLight}
                        $selected={!readOnly && selection === square}
                        disabled={isDisabled}
                        aria-label={`${square}: ${squareLabel}`}
                        aria-pressed={!readOnly && selection === square}
                        onClick={() => handleClick(square)}
                    >
                        {piece}
                        {isLegalDestination && (
                            <MoveIndicator
                                $capture={isCapture}
                                aria-hidden="true"
                            />
                        )}
                    </Square>
                )
            })}
        </Board>
    )
}

export default ChessBoard