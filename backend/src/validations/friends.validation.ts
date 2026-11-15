import { z } from 'zod';

export const friendParamsSchema = z.object({
	id: z.coerce.number().int().positive(),
});

export const friendRequestSchema = z.object({
	username: z.string().trim().min(1).max(32),
});
