import { z } from 'zod';

export const createUserSchema = 
	z.object({
		username: z.string().trim().min(1).max(32),
		email: z.email(),
		password: z.string().min(8).max(100)
	});

export const authUserSchema = 
	z.object({
		email: z.email(),
		password: z.string().min(8).max(8),
	});
