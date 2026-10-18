import { StatusBox } from './GameStatus.styles'

type GameStatusProps = {
    status: string
}

function GameStatus({ status }: GameStatusProps) {
    return (
        <StatusBox role="status">
            {status}
        </StatusBox>
    )
}

export default GameStatus