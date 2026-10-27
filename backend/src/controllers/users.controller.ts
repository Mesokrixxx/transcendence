import { type Request, type Response } from 'express';
import * as userService from '../services/users.service.js';
import { createUserSchema, updateUserSchema } from '../validations/users.validation.js';
import { query } from '../utils/query.js'
import { treatError } from '../utils/errors.js';

export async function getUser(req: Request, res: Response) {
	const id = Number(req.params.id);
	if (!Number.isInteger(id) || id <= 0)
		return res.status(400).json({ error: 'id shall be a positive integer' });

	const { result, error } = await query(() => userService.get(id));
	if (error) {
		const treatedErr = treatError(error);

		return res.status(treatedErr.status).json(treatedErr.error);
	}

	if (!result)
		return res.status(404).json({ error: 'user not found' });

	res.status(200).json(result);
}

export async function createUser(req: Request, res: Response) {
	const treatedReq = createUserSchema.safeParse(req.body);
	if (!treatedReq.success) {
		return res.status(400).json({
			error: 'Invalid request body',
			details: treatedReq.error.issues
		});
	}

	const { username, email, password } = treatedReq.data;
	const { result, error } = await query(() => userService.create(username, email, password));
	if (error) {
		const treatedErr = treatError(error);

		return res.status(treatedErr.status).json(treatedErr.error);
	}

	res.status(201).json(result);
}

export async function updateUser(req: Request, res: Response) {
	const user = req.user;
	if (!user)
		return res.status(401).json({ error: 'user must be logged in' });
	const treatedReq = updateUserSchema.safeParse(req.body);
	if (!treatedReq.success) {
		return res.status(400).json({
			error: 'invalid request body',
			details: treatedReq.error.issues,
		});
	}

	const { username, password, currentPassword } = treatedReq.data;
	
	const updateData: {
		username?: string,
		password?: string,
		currentPassword?: string,
	} = {};
	if (username) updateData.username = username;
	if (password) updateData.password = password;
	if (currentPassword) updateData.currentPassword = currentPassword;

	const { result, error } = await query(() => userService.update(user.id, updateData));
	if (error) {
		const treatedErr = treatError(error);
		return res.status(treatedErr.status).json(treatedErr.error);
	}

	return res.status(200).json(result);
}
