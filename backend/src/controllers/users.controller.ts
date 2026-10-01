import { type Request, type Response } from 'express';
import * as userService from '../services/users.service.js';
import { createUserScema as createUserSchema } from '../validations/users.validation.js';

export async function getUser(req: Request, res: Response) {
	const id = Number(req.params.id);
	if (!Number.isInteger(id) || id <= 0)
		return res.status(400).json({ error: 'id shall be a positive integer' });

	const user = await userService.get(id);
	if (!user)
		return res.status(404).json({ error: 'user not found' });

	res.status(200).json(user);
}

export async function createUser(req: Request, res: Response) {
	const result = createUserSchema.safeParse(req.body);
	if (!result.success) {
		return res.status(400).json({
			error: 'Invalid request body',
			details: result.error.issues
		});
	}

	const { username, email, password } = result.data;
	const user = await userService.create(username, email, password);

	res.status(201).json(user);
}
