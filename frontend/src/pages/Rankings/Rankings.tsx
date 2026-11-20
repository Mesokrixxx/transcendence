import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import { Page } from '../Home/Home.styles'
import {
  Content,
  Header,
  Eyebrow,
  TableWrapper,
  Table,
  PlayerCell,
  WinRate,
  RankCell,
  MedalSlot,
  StatusMessage,
  SearchBox
} from './Rankings.styles';
import Avatar from '../../components/Avatar/Avatar';
import { useTranslation, Trans } from 'react-i18next';
import { getRankings , type Player } from '../../services/rankings'
import realtimeSocket, { type RealtimeEvent } from '../../services/websocket'
import { useAuth } from '../../context/AuthContext'

function getWinRate(wins: number, games: number): number {
  if (games === 0) return 0;
  return Math.round((wins / games) * 100);
}

type Medal = {
  src: string;
  labelKey: 'firstPlace' | 'secondPlace' | 'thirdPlace';
};

const medals: Record<number, Medal | undefined> = {
  1: { src: '/medals/gold.svg', labelKey: 'firstPlace' },
  2: { src: '/medals/silver.svg', labelKey: 'secondPlace' },
  3: { src: '/medals/bronze.svg', labelKey: 'thirdPlace' },
};

function RankBadge({ rank }: { rank: number }) {
  const { t } = useTranslation('rankings');
  const medal = medals[rank];

  return (
    <RankCell>
      <MedalSlot>
        {medal && <img src={medal.src} alt={t(medal.labelKey)} />}
      </MedalSlot>
      <span>{rank}</span>
    </RankCell>
  );
}

function Rankings() {
  const { t } = useTranslation('rankings');

  const [players, setPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [search, setSearch] = useState('')
  const { user } = useAuth()

  useEffect(() => {
      getRankings()
          .then((data) => setPlayers(data))
          .catch(() => setHasError(true))
          .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    function updateProfile(event: RealtimeEvent) {
      if (
        event.type !== 'profile.changed' ||
        typeof event.userId !== 'number' ||
        typeof event.username !== 'string' ||
        (event.avatar !== null && typeof event.avatar !== 'string')
      ) return

      const userId = event.userId
      const username = event.username
      const avatar = event.avatar ?? undefined
      setPlayers((current) => current.map((player) =>
        player.id === userId ? { ...player, username, avatar } : player
      ))
    }

    return realtimeSocket.subscribe(updateProfile)
  }, [])

  // Live online status (the backend only sends presence.changed for friends).
  useEffect(() => {
    function updatePresence(event: RealtimeEvent) {
      if (
        event.type !== 'presence.changed' ||
        typeof event.userId !== 'number' ||
        typeof event.online !== 'boolean'
      ) return

      const userId = event.userId
      const online = event.online
      setPlayers((current) => current.map((player) =>
        player.id === userId ? { ...player, online } : player
      ))
    }

    return realtimeSocket.subscribe(updatePresence)
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
      content = <StatusMessage>{t('loading')}</StatusMessage>
  } else if (hasError) {
      content = <StatusMessage role="alert">{t('loadError')}</StatusMessage>
  } else if (players.length === 0) {
      content = <StatusMessage>{t('noPlayersYet')}</StatusMessage>
  } else if (visiblePlayers.length === 0) {
      content = <StatusMessage>{t('noMatch')}</StatusMessage>
  } else {
      content = (
          <TableWrapper>
              <Table>
                  <thead>
                      <tr>
                          <th>#</th>
                          <th>{t('player')}</th>
                          <th>{t('rating')}</th>
                          <th>{t('wins')}</th>
                          <th>{t('games')}</th>
                          <th>{t('winRate')}</th>
                      </tr>
                  </thead>
                  <tbody>
                      {visiblePlayers.map((player) => (
                          <tr key={player.id} data-top={player.rank === 1}>
                              <td><RankBadge rank={player.rank} /></td>
                              <td>
                                  <PlayerCell>
                                      <Avatar
                                          src={player.avatar||'/avatars/default.svg'}
                                          username={player.username}
                                          isOnline={player.id === user?.id || player.online}
                                          size={48}
                                      />
                                      <Link to={`/profile/${player.id}`}>
                                        <span style={{ display: 'block' }}>
                                            {player.displayName || player.username}
                                        </span>
                                        {player.displayName && player.displayName !== player.username && (
                                            <small style={{ display: 'block', opacity: 0.75 }}>
                                                @{player.username}
                                            </small>
                                        )}
                                      </Link>
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

      <Content className="container">
        <Header>
          <Eyebrow>{t('competitivePlay')}</Eyebrow>
          <h1>
            <Trans ns="rankings" i18nKey="playerRankingsTitle">
              Player <span>Rankings</span>
            </Trans>
          </h1>
          <p>{t('communityLeaderboardDescription')}</p>
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
                    placeholder={t('searchPlayersPlaceholder')}
                    aria-label={t('searchPlayerLabel')}    
                />
            </SearchBox>
        )}

        {content}
        
      </Content>

      <Footer />
    </Page>
  );
}

export default Rankings;
