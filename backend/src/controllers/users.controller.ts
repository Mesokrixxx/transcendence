import { type Request, type Response } from 'express';
import * as userService from '../services/users.service.ts';
import { isNonEmptyString } from '../utils/validates.ts';
import { type CreateUserBody } from '../../shared/routeBodyDefs.ts';

export function getUser(req: Request, res: Response) {
	const user = userService.get(req.params.id);
	if (!user)
		return res.status(404).json({ error: 'id is not link to any user' });
	res.status(201).json(user);
}

export function createUser(req: Request<{}, {}, CreateUserBody>, res: Response) {
	const { userName } = req.params.body ?? {};
	if (!isNonEmptyString(userName))
		return res.status(400).json({ error: 'user name shall be a non empty string' });

	const user = userService.create(userName);

	res.status(201).json(user);
}
