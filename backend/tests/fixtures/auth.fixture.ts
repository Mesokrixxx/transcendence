export const validCredentials = {
  email: 'alice@example.com',
  password: 'ValidPassword1!',
};

export const authenticatedUser = {
  id: 1,
  username: 'alice',
  email: validCredentials.email,
};

export const session = {
  token: 'session-token',
  expiresAt: new Date('2030-01-01T00:00:00.000Z'),
};
