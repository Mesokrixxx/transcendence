import type { AuthUser } from "../types/auth";
import fetchAPI from "../services/fetchAPI";
import { redirect } from "react-router-dom";

async function guestOnlyLoader() {
  const response = await fetchAPI<AuthUser>({
    path: '/auth/me',
    method: 'get',
  });
  if (response.error)
    return null;
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

export { guestOnlyLoader, requireAuthLoader };
