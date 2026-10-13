import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer'
import {Page} from './Home/Home.styles'
import { Content, TableWrapper, Table } from './Rankings.styles'

type Player =  {
    id: number
    username: string
    wins: number
    games: number
}

//fake data, pending the backend
//we rempace it by the response of GET /api/rankings
const fakePlayers: Player[] = [
    {id: 1, username: 'alice', wins:42, games: 60},
    {id: 2, username: 'bob', wins: 35, games: 55},
    {id: 3, username: 'charlie', wins: 20, games: 48},
]

function Rankings() {
    return (
        <Page>
            <Navbar />

            <Content className='container'>
                <h1>Ranking</h1>

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
                                    <td>{player.username}</td>
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