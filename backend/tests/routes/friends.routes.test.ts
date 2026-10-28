import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import friendsRouter from '../../src/routes/friends.routes.js';
import * as friendsService from '../../src/services/friends.service.js';
import { createTestApp } from '../helpers/createTestApp.js';
import { authenticatedUser } from '../fixtures/auth.fixture.js';

vi.mock('../../src/middlewares/auth.middleware.js', () => ({
  requireAuth: (
    req: { user?: typeof authenticatedUser },
    _res: unknown,
    next: () => void,
  ) => {
    req.user = authenticatedUser;
    next();
  },
}));

vi.mock('../../src/services/friends.service.js', () => ({
  getList: vi.fn(),
  addFriend: vi.fn(),
  delFriend: vi.fn(),
}));

const app = createTestApp(friendsRouter, '/api/friends');
const friend = { id: 2, username: 'bob', email: 'bob@example.com' };

describe('friend routes', () => {
  beforeEach(() => {
    vi.mocked(friendsService.getList).mockReset();
    vi.mocked(friendsService.addFriend).mockReset();
    vi.mocked(friendsService.delFriend).mockReset();
  });

  it('returns the authenticated user friend list', async () => {
    vi.mocked(friendsService.getList).mockResolvedValue([
      { ...friend, status: 'friend' },
    ]);

    const response = await request(app).get('/api/friends/me');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { ...friend, status: 'friend', online: false },
    ]);
    expect(friendsService.getList).toHaveBeenCalledWith(1);
  });

  it('adds a friend', async () => {
    vi.mocked(friendsService.addFriend).mockResolvedValue(friend);

    const response = await request(app).post('/api/friends/2');

    expect(response.status).toBe(201);
    expect(response.body).toEqual(friend);
    expect(friendsService.addFriend).toHaveBeenCalledWith(1, 2);
  });

  it('prevents adding oneself', async () => {
    const response = await request(app).post('/api/friends/1');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'cannot add yourself as a friend' });
    expect(friendsService.addFriend).not.toHaveBeenCalled();
  });

  it('deletes a friend', async () => {
    vi.mocked(friendsService.delFriend).mockResolvedValue(friend);

    const response = await request(app).delete('/api/friends/2');

    expect(response.status).toBe(204);
    expect(friendsService.delFriend).toHaveBeenCalledWith(1, 2);
  });

  it('rejects an invalid friend id', async () => {
    const response = await request(app).post('/api/friends/invalid');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('invalid request parameters');
    expect(friendsService.addFriend).not.toHaveBeenCalled();
  });
});
