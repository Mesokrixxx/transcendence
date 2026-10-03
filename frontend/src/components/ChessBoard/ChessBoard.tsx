import { Board, Square, Piece } from './ChessBoard.styles'

const backRow = [ 'rook', 'knight', 'bishop', 'queen', 'king', 'bishop','knight','rook']

function ChessBoard ()
{

    return(
        <Board className="chessboard" role="img" aria-label="Chessboard with pieces in their starting position">
            {
                Array.from({length: 64}, (_, index)=>{
                    const row = Math.floor(index / 8)
                    const column = index % 8
                    
                    let isLight = false

                    if((row +column) % 2 ===0){
                        isLight= true
                    }

                    let pieceFile = ''

                    if(row ===0){
                        pieceFile = 'black_' + backRow[column]
                    }
                    else if (row===1){
                        pieceFile = 'black_pawn'
                    }
                    else if (row===6){
                        pieceFile = 'white_pawn'
                    }
                    else if (row ===7){
                        pieceFile = 'white_' + backRow[column]
                    }
                    let piece = null

                    if (pieceFile !== ''){
                        piece = (
                            <Piece src={'/pieces/kosal/'+ pieceFile + '.svg'} alt="" />
                        )
                    }

                    return<Square key={index} $isLight={isLight}> {piece}</Square>
                })}
        </Board>
    )

}

export default ChessBoard