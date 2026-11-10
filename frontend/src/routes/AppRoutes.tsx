import type { RouteObject } from 'react-router-dom';
import Home from '../pages/Home/Home';
import Play from '../pages/Play/Play';
import Training from '../pages/Training/Training';
import Register from '../pages/Register';
import Login from '../pages/Login/Login';
import Profile from '../pages/Profile/Profile';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsOfService from '../pages/TermsOfService';
import Rankings from '../pages/Rankings/Rankings';
import Chat from '../pages/Chat/Chat';
import WatchGame from '../pages/Watch/WatchGame';
import Watch from '../pages/Watch/Watch';
import ErrorPage from '../pages/Errors/ErrorPage';
import ApiTest from '../pages/ApiTest';
import ProtectedPage from '../pages/ProtectedPage';
import { publicPageLoader, guestOnlyLoader, requireAuthLoader } from '../loaders/authLoaders';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <ProtectedPage />,
    loader: publicPageLoader,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },
  {
    element: <ProtectedPage />,
    loader: requireAuthLoader,
    children: [
      {
        path: '/play',
        element: <Play />,
      },
      {
        path: '/training',
        element: <Training />,
      },
      {
        path: '/watch',
        element: <Watch />,
      },
      {
        path: '/watch/:gameId',
        element: <WatchGame />,
      },
      {
        path: '/rankings',
        element: <Rankings />,
      },
      {
        path: '/profile',
        element: <Profile />,
      },
      {
        path: '/chat',
        element: <Chat />,
      },
    ],
  },
  {
    path: '/register',
    element: <Register />,
    loader: guestOnlyLoader,
  },
  {
    path: '/login',
    element: <Login />,
    loader: guestOnlyLoader,
  },
  {
    path: '/privacy',
    element: <PrivacyPolicy />,
  },
  {
    path: '/terms',
    element: <TermsOfService />,
  },
  {
    path: '/test-api',
    element: <ApiTest />,
  },
    {
    path: '/test-api',
    element: <ApiTest />,
  },
  {
    path: '/401',
    element: <ErrorPage code={401} />,
  },
  {
    path: '/403',
    element: <ErrorPage code={403} />,
  },
  {
    path: '/404',
    element: <ErrorPage code={404} />,
  },
  {
    path: '/500',
    element: <ErrorPage code={500} />,
  },
];

export default routes;