import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer'
import {Page} from './Home/Home.styles'
import { Content, Header, Eyebrow, TableWrapper, Table, PlayerCell } from './Rankings.styles'
import Avatar from '../components/Avatar/Avatar'

type Player =  {
    id: number
    username: string
    wins: number
    games: number
    avatar?: string
    isOnline?: boolean
}

//fake data, pending the backend
//we rempace it by the response of GET /api/rankings
const fakePlayers: Player[] = [
    {id: 1, username: 'alice', wins:42, games: 60, isOnline: true},
    {id: 2, username: 'bob', wins: 35, games: 55, isOnline: true, avatar: '../../public/pieces/kosal/white_king.svg'},
    {id: 3, username: 'charlie', wins: 20, games: 48, isOnline : false, avatar: '../../public/pieces/kosal/black_king.svg'},
    {id: 4, username: 'diana', wins: 12, games: 30},
]

function Rankings() {
    return (
        <Page>
            <Navbar />

            <Content className='container'>
                <Header>
                    <Eyebrow>Competitive play</Eyebrow>
                    <h1>Player <span>Rankings</span></h1>
                    <p>See how the community is climbing the leaderboard.</p>
                </Header>

                <TableWrapper>
                    <Table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Player</th>
                                <th>Wins</th>
                                <th>Games</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fakePlayers.map((player, index) => (
                                <tr key={player.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <PlayerCell>
                                            <Avatar
                                                src={player.avatar}
                                                username={player.username}
                                                isOnline={player.isOnline}
                                                size={48}
                                            />
                                            <span>{player.username}</span>
                                        </PlayerCell>
                                    </td>
                                    <td>{player.wins}</td>
                                    <td>{player.games}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </TableWrapper>
            </Content>

            <Footer/>
        </Page>
    )
}

export default Rankings