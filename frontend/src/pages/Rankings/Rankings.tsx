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
import { useAuth } from '../../context/AuthContext'
import { useFriendPresence } from '../../hooks/useFriendPresence'
import { getFriends } from '../../services/friends'
import { getRankings , type Player } from '../../services/rankings'
import realtimeSocket, { type RealtimeEvent } from '../../services/websocket'

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
  const { user } = useAuth()

  const [players, setPlayers] = useState<Player[]>([])
  const [friendStatuses, setFriendStatuses] = useState(() => new Map<number, boolean>())
  const friendPresence = useFriendPresence()
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
      getRankings()
          .then((data) => setPlayers(data))
          .catch(() => setHasError(true))
          .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    let active = true
    let latestLoad = 0

    async function loadFriends() {
      const load = ++latestLoad
      try {
        const { friends } = await getFriends()
        if (active && load === latestLoad) {
          setFriendStatuses(new Map(friends.map((friend) => [
            friend.id,
            friend.isOnline ?? false,
          ])))
        }
      } catch {
        // A friends API failure does not prevent the rankings from loading.
      }
    }

    function handleRealtimeEvent(event: RealtimeEvent) {
      if (
        event.type === 'presence.snapshot' ||
        event.type === 'friend.request.sent' ||
        event.type === 'friend.request.accepted' ||
        event.type === 'friend.changed' ||
        event.type === 'friend.blocked' ||
        event.type === 'friend.unblocked'
      ) {
        void loadFriends()
        return
      }

      if (
        event.type !== 'profile.changed' ||
        typeof event.userId !== 'number' ||
        typeof event.username !== 'string' ||
        (event.avatar !== null && typeof event.avatar !== 'string') ||
        (event.displayName !== null && typeof event.displayName !== 'string')
      ) return

      const userId = event.userId
      const username = event.username
      const avatar = event.avatar ?? undefined
      const displayName = event.displayName ?? null
      setPlayers((current) => current.map((player) =>
        player.id === userId ? { ...player, username, avatar, displayName } : player
      ))
    }

    const unsubscribe = realtimeSocket.subscribe(handleRealtimeEvent)
    void loadFriends()
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const rankedPlayers = players.map((player, index) => {
    const friendStatus = friendStatuses.get(player.id)
    return {
      ...player,
      rank: index + 1,
      isOnline: friendStatus === undefined
        ? undefined
        : friendPresence.get(player.id) ?? friendStatus,
    }
  })

  const searchTerm = search.trim().toLowerCase()
  const visiblePlayers = rankedPlayers.filter((player) =>
      player.username.toLowerCase().includes(searchTerm) ||
      player.displayName?.toLowerCase().includes(searchTerm))

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
                                          isOnline={player.id === user?.id || player.isOnline}
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
