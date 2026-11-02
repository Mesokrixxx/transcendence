import { type RouteObject } from 'react-router';
import App from '../App';
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
import ApiTest from '../pages/ApiTest';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
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
        path: '/register',
        element: <Register />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/profile',
        element: <Profile />,
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
        path: '/chat',
        element: <Chat />,
      },
      {
        path: '/test-api',
        element: <ApiTest />,
      },
    ],
  },
];

export default routes;
