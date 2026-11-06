import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import authRouter from '../../src/routes/auth.routes.js';
import * as authService from '../../src/services/auth.service.js';
import * as userService from '../../src/services/users.service.js';
import { createTestApp } from '../helpers/createTestApp.js';
import {
  authenticatedUser,
  session,
  validCredentials,
} from '../fixtures/auth.fixture.js';

vi.mock('../../src/services/auth.service.js', () => ({
  SESSION_COOKIE: 'session',
  SESSION_DURATION_SECONDS: 604800,
  createSession: vi.fn(),
  deleteSession: vi.fn(),
}));

vi.mock('../../src/services/users.service.js', () => ({
  auth: vi.fn(),
}));

const app = createTestApp(authRouter, '/api/auth');

describe('authentication routes', () => {
  beforeEach(() => {
    vi.mocked(userService.auth).mockReset();
    vi.mocked(authService.createSession).mockReset();
    vi.mocked(authService.deleteSession).mockReset();
  });

  describe('POST /api/auth/login', () => {
    it('rejects an invalid request body', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'not-an-email', password: 'short' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid request body');
      expect(userService.auth).not.toHaveBeenCalled();
    });

    it('rejects invalid credentials', async () => {
      vi.mocked(userService.auth).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validCredentials);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid credentials' });
      expect(authService.createSession).not.toHaveBeenCalled();
    });

    it('creates a session and returns the authenticated user', async () => {
      vi.mocked(userService.auth).mockResolvedValue(authenticatedUser);
      vi.mocked(authService.createSession).mockResolvedValue(session);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validCredentials);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(authenticatedUser);
      expect(response.headers['set-cookie']).toEqual([
        'session=session-token; Max-Age=604800; Path=/; HttpOnly; SameSite=Lax',
      ]);
      expect(authService.createSession).toHaveBeenCalledWith(
        authenticatedUser.id,
      );
    });
  });

  describe('POST /api/auth/logout', () => {
    it('clears the session cookie without requiring authentication', async () => {
      const response = await request(app).post('/api/auth/logout');

      expect(response.status).toBe(204);
      expect(response.headers['set-cookie']).toEqual([
        'session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax',
      ]);
      expect(authService.deleteSession).not.toHaveBeenCalled();
    });

    it('deletes the session identified by the cookie', async () => {
      vi.mocked(authService.deleteSession).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', 'session=session-token');

      expect(response.status).toBe(204);
      expect(authService.deleteSession).toHaveBeenCalledWith('session-token');
    });
  });
});
