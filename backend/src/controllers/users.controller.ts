import { type Request, type Response } from 'express';
import * as userService from '../services/users.service.js';
import { isNonEmptyString } from '../utils/validates.js';
import { type CreateUserBody } from '../shared/routeBodyDefs.js';

export function getUser(req: Request, res: Response) {
	const user = userService.get(Number(req.params.id));
	if (!user)
		return res.status(404).json({ error: 'id is not link to any user' });
	res.status(201).json(user);
}

export function createUser(req: Request<{}, {}, CreateUserBody>, res: Response) {
	const { name } = req.body ?? {};
	if (!isNonEmptyString(name))
		return res.status(400).json({ error: 'user name shall be a non empty string' });

	const user = userService.create(name);

	res.status(201).json(user);
}
