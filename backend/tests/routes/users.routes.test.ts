import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import usersRouter from '../../src/routes/users.routes.js';
import * as userService from '../../src/services/users.service.js';
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

vi.mock('../../src/services/users.service.js', () => ({
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
}));

const app = createTestApp(usersRouter, '/api/users');

describe('user routes', () => {
  beforeEach(() => {
    vi.mocked(userService.get).mockReset();
    vi.mocked(userService.create).mockReset();
    vi.mocked(userService.update).mockReset();
  });

  it('gets a user by id', async () => {
    vi.mocked(userService.get).mockResolvedValue(authenticatedUser);

    const response = await request(app).get('/api/users/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(authenticatedUser);
    expect(userService.get).toHaveBeenCalledWith(1);
  });

  it('rejects an invalid user id', async () => {
    const response = await request(app).get('/api/users/nope');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'id shall be a positive integer' });
    expect(userService.get).not.toHaveBeenCalled();
  });

  it('creates a user with a valid body', async () => {
    vi.mocked(userService.create).mockResolvedValue(authenticatedUser);

    const response = await request(app).post('/api/users').send({
      username: 'alice',
      email: 'alice@example.com',
      password: 'ValidPassword1!',
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(authenticatedUser);
    expect(userService.create).toHaveBeenCalledWith(
      'alice',
      'alice@example.com',
      'ValidPassword1!',
    );
  });

  it('rejects an invalid create body', async () => {
    const response = await request(app).post('/api/users').send({
      username: '',
      email: 'invalid',
      password: 'short',
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid request body');
    expect(userService.create).not.toHaveBeenCalled();
  });

  it('updates the authenticated user', async () => {
    vi.mocked(userService.update).mockResolvedValue({
      ...authenticatedUser,
      username: 'new-alice',
    });

    const response = await request(app)
      .patch('/api/users/me')
      .send({ username: 'new-alice' });

    expect(response.status).toBe(200);
    expect(response.body.username).toBe('new-alice');
    expect(userService.update).toHaveBeenCalledWith(1, {
      username: 'new-alice',
    });
  });

  it('rejects an empty update body', async () => {
    const response = await request(app).patch('/api/users/me').send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('invalid request body');
    expect(userService.update).not.toHaveBeenCalled();
  });
});
