import fetchAPI from './fetchAPI';

export async function updateProfileNames(firstName: string, lastName: string) {
  const response = await fetchAPI({
    path: '/users/me',
    method: 'patch',
    body: {
      firstName: firstName.trim() || null,
      lastName: lastName.trim() || null,
    },
  });

  if (response.error) {
    throw new Error('Profile update failed');
  }
}