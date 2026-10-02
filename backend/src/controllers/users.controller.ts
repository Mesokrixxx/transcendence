import { type Request, type Response } from 'express';
import * as userService from '../services/users.service.js';
import { createUserScema as createUserSchema } from '../validations/users.validation.js';
import { query } from '../utils/query.js'
import { prismaTreatError } from '../utils/prismaError.js';

export async function getUser(req: Request, res: Response) {
	const id = Number(req.params.id);
	if (!Number.isInteger(id) || id <= 0)
		return res.status(400).json({ error: 'id shall be a positive integer' });

	const { result, error } = await query(() => userService.get(id));
	if (error) {
		const treatedErr = prismaTreatError(error);

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
		const treatedErr = prismaTreatError(error);

		return res.status(treatedErr.status).json(treatedErr.error);
	}

	res.status(201).json(result);
}
