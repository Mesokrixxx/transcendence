import './ChessBoard.css'

function ChessBoard ()
{

    return(
        <div className="chessboard" role="img" aria-label="ChessBoard">
            {
                Array.from({length: 64}, (_, index)=>{
                    const row = Math.floor(index / 8)
                    const column = index % 8
                    
                    let squareColor = 'chessboard__square--dark'

                    if((row +column) % 2 ===0){
                        squareColor='chessboard__square--lght'
                    }

                    return (
                        <div
                            key={index}
                            className={' chessboard__square ' + squareColor}
                        />
                    )
                })

            }
        </div>
    )

}

export default ChessBoard