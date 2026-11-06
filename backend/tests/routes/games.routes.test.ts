import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import gamesRouter from '../../src/routes/games.routes.js';
import * as gameService from '../../src/services/games.service.js';
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

vi.mock('../../src/services/games.service.js', () => ({
  getState: vi.fn(),
  create: vi.fn(),
  playMove: vi.fn(),
  resign: vi.fn(),
  draw: vi.fn(),
}));

vi.mock('../../src/services/gamePresence.service.js', () => ({
  broadcast: vi.fn(),
}));

const app = createTestApp(gamesRouter, '/api/games');
const game = { id: 7, status: 'PLAYING', moves: [] };

describe('game routes', () => {
  beforeEach(() => {
    vi.mocked(gameService.getState).mockReset();
    vi.mocked(gameService.create).mockReset();
    vi.mocked(gameService.playMove).mockReset();
    vi.mocked(gameService.resign).mockReset();
    vi.mocked(gameService.draw).mockReset();
  });

  it('gets a game', async () => {
    vi.mocked(gameService.getState).mockResolvedValue(game);

    const response = await request(app).get('/api/games/7');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(game);
    expect(gameService.getState).toHaveBeenCalledWith(7);
  });

  it('creates a game when the authenticated user is a player', async () => {
    vi.mocked(gameService.create).mockResolvedValue(game);

    const response = await request(app)
      .post('/api/games')
      .send({ whiteId: 1, blackId: 2 });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(game);
    expect(gameService.create).toHaveBeenCalledWith(1, 2);
  });

  it('rejects game creation for a non-player', async () => {
    const response = await request(app)
      .post('/api/games')
      .send({ whiteId: 2, blackId: 3 });

    expect(response.status).toBe(403);
    expect(gameService.create).not.toHaveBeenCalled();
  });

  it('plays a move', async () => {
    vi.mocked(gameService.playMove).mockResolvedValue(game);

    const response = await request(app)
      .post('/api/games/7/moves')
      .send({ from: 'e2', to: 'e4' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(game);
    expect(gameService.playMove).toHaveBeenCalledWith(7, 1, {
      from: 'e2',
      to: 'e4',
    });
  });

  it('rejects an invalid move', async () => {
    const response = await request(app)
      .post('/api/games/7/moves')
      .send({ from: 'z9', to: 'e4' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid body request');
    expect(gameService.playMove).not.toHaveBeenCalled();
  });

  it('resigns a game', async () => {
    vi.mocked(gameService.resign).mockResolvedValue(game);

    const response = await request(app).post('/api/games/7/resign');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(game);
    expect(gameService.resign).toHaveBeenCalledWith(7, 1);
  });

  it('offers a draw', async () => {
    vi.mocked(gameService.draw).mockResolvedValue(game);

    const response = await request(app).post('/api/games/7/draw');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(game);
    expect(gameService.draw).toHaveBeenCalledWith(7, 1);
  });
});
