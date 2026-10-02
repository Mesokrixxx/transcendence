import { z } from 'zod';

export const createUserScema = 
	z.object({
		username: z.string().trim().min(1).max(32),
		email: z.email(),
		password: z.string().min(8).max(100)
	});
