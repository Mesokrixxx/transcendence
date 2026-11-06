import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import chatsRouter from '../../src/routes/chats.routes.js';
import * as chatService from '../../src/services/chats.services.js';
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

vi.mock('../../src/services/chats.services.js', () => ({
  get: vi.fn(),
  create: vi.fn(),
  append: vi.fn(),
}));

const app = createTestApp(chatsRouter, '/api/chats');
const chat = { id: 4, messages: [], users: [authenticatedUser] };

describe('chat routes', () => {
  beforeEach(() => {
    vi.mocked(chatService.get).mockReset();
    vi.mocked(chatService.create).mockReset();
    vi.mocked(chatService.append).mockReset();
  });

  it('gets a chat', async () => {
    vi.mocked(chatService.get).mockResolvedValue(chat);

    const response = await request(app).get('/api/chats/4');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(chat);
    expect(chatService.get).toHaveBeenCalledWith(4);
  });

  it('creates a chat', async () => {
    vi.mocked(chatService.create).mockResolvedValue(chat);

    const response = await request(app).post('/api/chats');

    expect(response.status).toBe(201);
    expect(response.body).toEqual(chat);
  });

  it('appends a message to a chat', async () => {
    vi.mocked(chatService.append).mockResolvedValue(chat);

    const response = await request(app)
      .put('/api/chats/4')
      .send({ message: 'Hello!' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(chat);
    expect(chatService.append).toHaveBeenCalledWith('Hello!', 4, 1);
  });

  it('rejects an invalid message body', async () => {
    const response = await request(app)
      .put('/api/chats/4')
      .send({ message: '' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('invalid request body');
    expect(chatService.append).not.toHaveBeenCalled();
  });

  it('rejects an invalid chat id', async () => {
    const response = await request(app)
      .put('/api/chats/nope')
      .send({ message: 'Hello!' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'id shall be a positive integer' });
  });
});
