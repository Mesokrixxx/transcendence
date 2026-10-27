import { z } from 'zod';

export const friendParamsSchema = z.object({
	id: z.coerce.number().int().positive(),
});
