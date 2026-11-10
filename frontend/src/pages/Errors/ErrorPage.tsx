import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import Button from '../../components/Button/Button';
import ChessBoard from '../../components/ChessBoard/ChessBoard';
import type { Board as BoardData } from '../../../../chessgame/src/chessgame.types';
import { Page } from '../Home/Home.styles';
import { ErrorContent, ErrorCard, ErrorBoard, ErrorIllustration, ErrorCode, ErrorActions } from './ErrorPage.styles';

type ErrorPageProps = {
  code: 401 | 403 | 404 | 500;
};

const lostKnightBoard = Object.fromEntries(
  Array.from({ length: 64 }, (_, index) => {
    const file = 'abcdefgh'[index % 8];
    const rank = Math.floor(index / 8) + 1;

    return [`${file}${rank}`, null];
  }),
) as BoardData;

lostKnightBoard.d5 = {
  color: 'white',
  type: 'knight',
};

function ErrorPage({ code }: ErrorPageProps) {
  const { t } = useTranslation('errors');

  const pieces = {
  401: '/pieces/kosal/white_pawn.svg',
  403: '/pieces/kosal/white_rook.svg',
  404: '/pieces/kosal/white_knight.svg',
  500: '/pieces/kosal/white_king.svg',
  };

  const messages = {
    401: {
      title: t('unauthorizedTitle'),
      description: t('unauthorizedDescription'),
    },
    403: {
      title: t('forbiddenTitle'),
      description: t('forbiddenDescription'),
    },
    404: {
      title: t('notFoundTitle'),
      description: t('notFoundDescription'),
    },
    500: {
      title: t('serverErrorTitle'),
      description: t('serverErrorDescription'),
    },
  };

  const message = messages[code];

  return (
    <Page>
      <Navbar />

      <ErrorContent className="container">
        <ErrorCard aria-labelledby="error-title">
           <ErrorIllustration aria-hidden="true">
                {code === 404 ? (
                    <ErrorBoard>
                    <ChessBoard board={lostKnightBoard} readOnly />
                    </ErrorBoard>
                ) : (
                    <img
                    src={pieces[code]}
                    alt=""
                    className={code === 500 ? 'fallen' : undefined}
                    />
                )}

                <ErrorCode>
                    <span>{String(code).slice(0, 1)}</span>
                    {String(code).slice(1)}
                </ErrorCode>
           </ErrorIllustration>

          <h1 id="error-title" className="visually-hidden">{message.title}</h1>
          <p>{message.description}</p>

          <ErrorActions>
            {code === 401 && (
              <Button to="/login">
                {t('signIn')}
              </Button>
            )}

            {code === 500 && (
              <Button onClick={() => window.location.reload()}>
                {t('tryAgain')}
              </Button>
            )}

            <Button
              to="/"
              variant={code === 401 || code === 500 ? 'secondary' : 'primary'}
            >
              {t('backHome')}
            </Button>
          </ErrorActions>
        </ErrorCard>
      </ErrorContent>

      <Footer />
    </Page>
  );
}

export default ErrorPage;