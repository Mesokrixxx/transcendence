import { useEffect, useState, type ReactNode } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import { getRankings , type Player } from './ranking.service'
import { Page } from '../Home/Home.styles'
import {
    Content,
    Header,
    Eyebrow,
    SearchBox,
    TableWrapper,
    Table,
    PlayerCell,
    WinRate,
    RankCell,
    MedalSlot,
    StatusMessage } from './Rankings.styles'
import Avatar from '../../components/Avatar/Avatar'


function getWinRate(wins: number, games: number): number {
    if (games === 0) return 0
    return Math.round((wins / games) * 100)
}

type Medal = {
    src: string
    label: string
}

const medals: Record<number, Medal | undefined> = {
    1 : {src: '/medals/gold.svg', label: 'First place'},
    2 : {src: '/medals/silver.svg', label: 'Second place'},
    3 : {src: '/medals/bronze.svg', label: 'Third place'},
}

function RankBadge({ rank }: {rank: number}){
    const medal = medals[rank]

    return (
        <RankCell>
            <MedalSlot>
                {medal && <img src={medal.src} alt={medal.label} />}
            </MedalSlot>
            <span>{rank}</span>
        </RankCell>
    )
}

function Rankings() {

    const [players, setPlayers] = useState<Player[]>([])
    const [isLoading, setIsLoagding] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState('')

    useEffect(() => {
        getRankings()
            .then((data) => setPlayers(data))
            .catch(() => setError('Could not load the rankings.'))
            .finally(() => setIsLoagding(false))
    }, [])

    const rankedPlayers = players.map((player, index) => ({
        ...player,
        rank: index + 1,
    }))

    const searchTerm = search.trim().toLowerCase()
    const visiblePlayers = rankedPlayers.filter((player) =>
        player.username.toLowerCase().includes(searchTerm))

    let content: ReactNode
    if (isLoading) {
        content = <StatusMessage>Loading...</StatusMessage>
    } else if (error) {
        content = <StatusMessage role="alert">{error}</StatusMessage>
    } else if (players.length === 0) {
        content = <StatusMessage>No players yet.</StatusMessage>
    } else if (visiblePlayers.length === 0) {
        content = <StatusMessage>No players matches your search.</StatusMessage>
    } else {
        content = (
            <TableWrapper>
                <Table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Player</th>
                            <th>Rating</th>
                            <th>Wins</th>
                            <th>Games</th>
                            <th>Win rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visiblePlayers.map((player) => (
                            <tr key={player.id} data-top={player.rank === 1}>
                                <td><RankBadge rank={player.rank} /></td>
                                <td>
                                    <PlayerCell>
                                        <Avatar
                                            src={player.avatar}
                                            username={player.username}
                                            isOnline={player.isOnline}
                                            size={48}
                                        />
                                        <span title={player.username}>{player.username}</span>
                                    </PlayerCell>
                                </td>
                                <td>{player.rating}</td>
                                <td>{player.wins}</td>
                                <td>{player.games}</td>
                                <WinRate>{getWinRate(player.wins, player.games)}%</WinRate>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </TableWrapper>
        )
    }

    return (
        <Page>
            <Navbar />

            <Content className='container'>
                <Header>
                    <Eyebrow>Competitive play</Eyebrow>
                    <h1>Player <span>Rankings</span></h1>
                    <p>See how the community is climbing the leaderboard.</p>
                </Header>

                {players.length > 0 && (
                    <SearchBox>
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            aria-hidden="true"
                        >
                            <circle cx="11" cy="11" r="7"/>
                            <path d="M20 20l-3.5-3.5"/>
                        </svg>
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search players..."
                            aria-label="Search players"    
                        />
                    </SearchBox>
                )}

                {content}

            </Content>

            <Footer/>
        </Page>
    )
}

export default Rankings