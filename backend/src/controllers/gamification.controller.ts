import { type Request, type Response } from 'express';
import * as gamificationService from '../services/gamification.service.js';
import { query } from '../utils/query.js';
import { treatError } from '../utils/errors.js';
import { z } from 'zod';
import * as presenceService from '../services/presence.service.js';

export async function getProgress(req: Request, res: Response) {
  if (!req.user)
    return res.status(401).json({ error: 'user must be logged in' });
  const { result, error } = await query(() =>
    gamificationService.getProgress(req.user!.id),
  );
  if (error) {
    const treated = treatError(error);
    return res.status(treated.status).json(treated.error);
  }
  return res.status(200).json(result);
}

export async function setBadgeFeatured(req: Request, res: Response) {
  if (!req.user)
    return res.status(401).json({ error: 'user must be logged in' });
  const body = z.object({ featured: z.boolean() }).safeParse(req.body);
  if (!body.success)
    return res.status(400).json({ error: 'featured must be a boolean' });
  const code = req.params.code;
  if (typeof code !== 'string')
    return res.status(400).json({ error: 'invalid badge code' });
  const { result, error } = await query(() =>
    gamificationService.setBadgeFeatured(
      req.user!.id,
      code,
      body.data.featured,
    ),
  );
  if (error) {
    const treated = treatError(error);
    return res.status(treated.status).json(treated.error);
  }
  if (!result) return res.status(404).json({ error: 'badge not found' });
  presenceService.send(req.user.id, {
    type: 'gamification.updated',
    progress: await gamificationService.getProgress(req.user.id),
  });
  return res.status(200).json(result);
}
