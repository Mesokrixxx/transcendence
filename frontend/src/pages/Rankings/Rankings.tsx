import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { Page } from '../Home/Home.styles';
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
} from './Rankings.styles';
import Avatar from '../../components/Avatar/Avatar';
import { useTranslation, Trans } from 'react-i18next';

type Player = {
  id: number;
  username: string;
  rating: number;
  wins: number;
  games: number;
  avatar?: string;
  isOnline?: boolean;
};

//fake data, pending the backend
//we rempace it by the response of GET /api/rankings
const fakePlayers: Player[] = [
  {
    id: 1,
    username: 'alice',
    rating: 1842,
    wins: 42,
    games: 60,
    isOnline: true,
    avatar: '/avatars/queen.svg',
  },
  {
    id: 2,
    username: 'bob',
    rating: 1755,
    wins: 35,
    games: 55,
    isOnline: false,
    avatar: '/avatars/king.svg',
  },
  {
    id: 3,
    username: 'charlie',
    rating: 1610,
    wins: 20,
    games: 48,
    avatar: '/avatars/knight.svg',
  },
  {
    id: 4,
    username: 'jack',
    rating: 1440,
    wins: 15,
    games: 35,
    isOnline: true,
  },
  {
    id: 5,
    username: 'diana',
    rating: 1300,
    wins: 12,
    games: 30,
    isOnline: false,
  },
  { id: 6, username: 'sofia', rating: 1210, wins: 10, games: 25 },
];

function getWinRate(wins: number, games: number): number {
  if (games === 0) return 0;
  return Math.round((wins / games) * 100);
}

type Medal = {
  src: string;
  labelKey:
    'rankings:firstPlace' | 'rankings:secondPlace' | 'rankings:thirdPlace';
};

const medals: Record<number, Medal | undefined> = {
  1: { src: '/medals/gold.svg', labelKey: 'rankings:firstPlace' },
  2: { src: '/medals/silver.svg', labelKey: 'rankings:secondPlace' },
  3: { src: '/medals/bronze.svg', labelKey: 'rankings:thirdPlace' },
};

function RankBadge({ rank }: { rank: number }) {
  const { t } = useTranslation();
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
  const { t } = useTranslation();
  return (
    <Page>
      <Navbar />

      <Content className="container">
        <Header>
          <Eyebrow>{t('rankings:competitivePlay')}</Eyebrow>
          <h1>
            <Trans i18nKey="rankings:playerRankingsTitle">
              Player <span>Rankings</span>
            </Trans>
          </h1>
          <p>{t('rankings:communityLeaderboardDescription')}</p>
        </Header>

        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <th>#</th>
                <th>{t('rankings:player')}</th>
                <th>{t('rankings:rating')}</th>
                <th>{t('rankings:wins')}</th>
                <th>{t('rankings:games')}</th>
                <th>{t('rankings:winRate')}</th>
              </tr>
            </thead>
            <tbody>
              {fakePlayers.map((player, index) => (
                <tr key={player.id}>
                  <td>
                    <RankBadge rank={index + 1} />
                  </td>
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
      </Content>

      <Footer />
    </Page>
  );
}

export default Rankings;
