import { useState } from 'react'
import ChessGame from '../../../../chessgame/src/chessgame'
import type {
    Move,
    Square as SquareName
} from '../../../../chessgame/src/chessgame.types'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import ChessBoard from '../../components/ChessBoard/ChessBoard'
import Avatar from '../../components/Avatar/Avatar'
import GameStatus from '../../components/GameStatus/GameStatus'
import Button from '../../components/Button/Button'
import { Page } from '../Home/Home.styles'
import { PlayContent, GameArea, GameInfo } from './Play.styles'

function Play() {
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

    let currentColor
    let winner

    if (game.getTurn() === 'white') {
        currentColor = 'White'
        winner = 'Black'
    } else {
        currentColor = 'Black'
        winner = 'White'
    }

    let status = currentColor + ' to move'

    if (game.isCheckmate()) {
        status = 'Checkmate — ' + winner + ' wins'
    } else if (game.isDraw()) {
        status = 'Draw'
    } else if (game.isCheck()) {
        status += ' — Check'
    }

    return (
        <Page>
            <Navbar />

            <PlayContent className="container">
                <GameArea aria-label="Local chess game">
                    <GameInfo aria-label="Game information">
                        <div className="opponent">
                            <Avatar
                                username="Opponent"
                                size={64}
                                isOnline={true}
                            />
                            <span>Opponent</span>
                        </div>

                        <GameStatus status={status} />

                        {promotionMoves.length > 0 && (
                            <div
                                role="group"
                                aria-label="Choose a promotion piece"
                            >
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
                    </GameInfo>

                    <ChessBoard
                        board={board}
                        selectedSquare={selectedSquare}
                        onSquareClick={handleSquareClick}
                        disabled={
                            game.isOver() || promotionMoves.length > 0
                        }
                    />
                </GameArea>
            </PlayContent>

            <Footer />
        </Page>
    )
}

export default Play