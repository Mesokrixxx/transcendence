import { z } from 'zod';

export const createGameSchema = z
	.object({
		whiteId: z.number().int().positive(),
		blackId: z.number().int().positive()
	})
	.refine((data) => data.whiteId !== data.blackId, {
		message: 'Players must be different'
	});
