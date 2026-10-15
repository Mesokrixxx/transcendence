import { useState } from 'react'
import ChessGame from '../../../../chessgame/src/chessgame'
import type {
    Move,
    Square as SquareName
} from '../../../../chessgame/src/chessgame.types'
import { Board, Square, Piece } from '../ChessBoard/ChessBoard.styles'
import Button from '../Button/Button'

function PlayableChessBoard() {
    const [game, setGame] = useState(() => new ChessGame())
    const [selectedSquare, setSelectedSquare] =
        useState<SquareName | null>(null)
    const [promotionMoves, setPromotionMoves] = useState<Move[]>([])
    const [error, setError] = useState('')

    const board = game.getBoard()

    function playMove(move: Move) {
        try {
            const nextGame = new ChessGame([...game.getHistory(), move])

            setGame(nextGame)
            setSelectedSquare(null)
            setPromotionMoves([])
            setError('')
        } catch (error: unknown) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Unable to play this move.'
            )
        }
    }

    function handleSquareClick(square: SquareName) {
        if (game.isOver() || promotionMoves.length > 0) return

        setError('')

        if (selectedSquare === square) {
            setSelectedSquare(null)
            return
        }

        if (selectedSquare) {
            const moves = game
                .getMoves(selectedSquare)
                .filter((move) => move.to === square)

            if (moves.some((move) => move.promotion !== undefined)) {
                setPromotionMoves(moves)
                return
            }

            const move = moves[0]

            if (move) {
                playMove(move)
                return
            }
        }

        const piece = board[square]

        if (piece && piece.color === game.getTurn()) {
            setSelectedSquare(square)
        } else {
            setSelectedSquare(null)
        }
    }

    let status = `${game.getTurn() === 'white' ? 'White' : 'Black'} to move`

    if (game.isCheckmate()) {
        status = `Checkmate — ${
            game.getTurn() === 'white' ? 'Black' : 'White'
        } wins`
    } else if (game.isDraw()) {
        status = 'Draw'
    } else if (game.isCheck()) {
        status += ' — Check'
    }

    return (
        <>
            <p role="status">{status}</p>

            <Board aria-label="Playable chessboard">
                {Array.from({ length: 64 }, (_, index) => {
                    const row = Math.floor(index / 8)
                    const column = index % 8
                    const square =
                        `${'abcdefgh'[column]}${8 - row}` as SquareName
                    const piece = board[square]

                    return (
                        <Square
                            key={square}
                            type="button"
                            $isLight={(row + column) % 2 === 0}
                            $selected={selectedSquare === square}
                            disabled={
                                game.isOver() || promotionMoves.length > 0
                            }
                            aria-label={`${square}: ${
                                piece
                                    ? `${piece.color} ${piece.type}`
                                    : 'empty'
                            }`}
                            aria-pressed={selectedSquare === square}
                            onClick={() => handleSquareClick(square)}
                        >
                            {piece && (
                                <Piece
                                    src={`/pieces/kosal/${piece.color}_${piece.type}.svg`}
                                    alt=""
                                    draggable={false}
                                />
                            )}
                        </Square>
                    )
                })}
            </Board>

            {promotionMoves.length > 0 && (
                <div role="group" aria-label="Choose a promotion piece">
                    <p>Promote your pawn:</p>

                    {promotionMoves.map((move) => (
                        <Button
                            key={move.promotion}
                            onClick={() => playMove(move)}
                        >
                            {move.promotion}
                        </Button>
                    ))}

                    <Button
                        variant="secondary"
                        onClick={() => setPromotionMoves([])}
                    >
                        Cancel
                    </Button>
                </div>
            )}

            {error && <p role="alert">{error}</p>}
        </>
    )
}

export default PlayableChessBoard