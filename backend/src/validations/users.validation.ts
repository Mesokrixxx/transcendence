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
		password: z.string().min(8).max(100),
	});

export const updateUserSchema =
	z.object({
		username: z.string().trim().min(1).max(32).optional(),
		password: z.string().min(8).max(100).optional(),
		currentPassword: z.string().min(1).optional(),
	}).refine(
		(data) => data.username !== undefined || data.password !== undefined,
		{ message: 'at least one field must be updated' }
	).refine(
		(data) => data.password === undefined || data.currentPassword !== undefined,
		{ message: 'currentPassword is required to change password', path: ['currentPassword'] }
	);
