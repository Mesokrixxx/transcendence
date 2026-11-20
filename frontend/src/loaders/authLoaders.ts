import type { AuthUser } from '../types/auth';
import fetchAPI from '../services/fetchAPI';
import { redirect } from 'react-router-dom';
import localStorage from '../services/localStorage';

async function publicPageLoader() {
  const response = await fetchAPI<AuthUser>({
    path: '/auth/me',
    method: 'get',
  });
  return response.error ? null : response.result;
}

async function guestOnlyLoader() {
  const response = await fetchAPI<AuthUser>({
    path: '/auth/me',
    method: 'get',
  });
  if (response.error) return null;
  return redirect('/');
}

async function requireAuthLoader() {
  const response = await fetchAPI<AuthUser>({
    path: '/auth/me',
    method: 'get',
  });
  if (response.error) {
    return redirect('/login');
  }
  return response.result;
}

async function githubLoader() {
  const redirectResponse = await guestOnlyLoader();
  if (redirectResponse) return redirectResponse;

  const client_id = import.meta.env.VITE_OAUTH_CLIENT_ID;
  const redirect_uri = import.meta.env.VITE_OAUTH_REDIRECT_URI;
  if (
    typeof client_id !== 'string' ||
    typeof redirect_uri !== 'string' ||
    !(client_id.length > 0) ||
    !(redirect_uri.length > 0)
  )
    return redirect('/');
  const state = crypto.randomUUID();
  localStorage.set('githubState', state);
  return redirect(
    `https://github.com/login/oauth/authorize?client_id=${client_id}&response_type=code&scope=repo&redirect_uri=${redirect_uri}&state=${state}&scope=user:email`,
  );
}

async function githubCallbackLoader({ request }: { request: Request }) {
  const redirectResponse = await guestOnlyLoader();
  if (redirectResponse) return redirectResponse;

  const searchParams = new URL(request.url).searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const expectedState = localStorage.get('githubState');


  localStorage.remove('githubState');

  if (!code || !state || state !== expectedState) {
    return redirect('/');
  }
    const response = await fetchAPI({
    path: `/auth/oauth?code=${encodeURIComponent(code)}`,
    method: 'post',
  });

  if (response.error) {
    return redirect('/');
  }

  return redirect('/profile');
}

export {
  publicPageLoader,
  guestOnlyLoader,
  requireAuthLoader,
  githubLoader,
  githubCallbackLoader,
};
