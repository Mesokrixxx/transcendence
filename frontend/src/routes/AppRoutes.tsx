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
import {
  publicPageLoader,
  guestOnlyLoader,
  requireAuthLoader,
  githubLoader,
  githubCallbackLoader,
} from '../loaders/authLoaders';

// Shown while a route loader runs on the first page load (e.g. after F5).
// Kept empty on purpose: translations may not be loaded yet at that moment.
const loadingFallback = <div aria-busy="true" />;

const routes: RouteObject[] = [
  {
    path: '/',
    element: <ProtectedPage />,
    loader: publicPageLoader,
    hydrateFallbackElement: loadingFallback,
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
    hydrateFallbackElement: loadingFallback,
    children: [
      {
        path: '/play',
        element: <Play />,
      },
      {
        path: '/play/:gameId',
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
        path: '/profile/:id',
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
    hydrateFallbackElement: loadingFallback,
  },
  {
    path: '/login',
    element: <Login />,
    loader: guestOnlyLoader,
    hydrateFallbackElement: loadingFallback,
  },
  {
    path: '/github-signin',
    loader: githubLoader,
    element: loadingFallback,
    hydrateFallbackElement: loadingFallback,
  },
  {
    path: '/github-signin/callback',
    loader: githubCallbackLoader,
    element: loadingFallback,
    hydrateFallbackElement: loadingFallback,
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
  {
    path: '*',
    element: <ErrorPage code={404} />,
  },
];

export default routes;
