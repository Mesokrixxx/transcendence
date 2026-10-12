import { type Request, type Response } from 'express';
import * as friendsService from '../services/friends.service.js';
import { query } from '../utils/query.js';
import { treatError } from '../utils/errors.js';
import { isOnline } from '../services/presence.service.js';
import { friendParamsSchema } from '../validations/friends.validation.js';

export async function getList(req: Request, res: Response) {
	const user = req.user;
	if (!user) 
		return res.status(401).json({ error: 'user must be logged in' });

	const { result, error } = await query(() => friendsService.getList(user.id));
	if (error) {
		const treatedErr = treatError(error);
		return res.status(treatedErr.status).json(treatedErr.error);
	}

	if (!result) 
		return res.status(404).json({ error: 'user not found' });

	return res.status(200).json(
		result.map((friend) => ({
			...friend,
			online: isOnline(friend.id),
		})));
}

export async function addFriend(req: Request, res: Response) {
	const user = req.user;
	if (!user)
		return res.status(401).json({ error: 'user must be logged in' });

	const treatedParams = friendParamsSchema.safeParse(req.params);
	if (!treatedParams.success) {
		return res.status(400).json({
				error: 'invalid request parameters',
				details: treatedParams.error.issues,
			});
	}

	const { id } = treatedParams.data;
	if (id === user.id)
		return res.status(400).json({ error: 'cannot add yourself as a friend' });

	const { result, error } = await query(() => friendsService.addFriend(user.id, id));
	if (error) {
		const treatedErr = treatError(error);
		return res.status(treatedErr.status).json(treatedErr.error);
	}

	if (!result) 
		return res.status(404).json({ error: 'user not found' });

	return res.status(201).json(result);
}

export async function delFriend(req: Request, res: Response) {
	const user = req.user;
	if (!user) 
		return res.status(401).json({ error: 'user must be logged in' });
	
	const treatedParams = friendParamsSchema.safeParse(req.params);
	if (!treatedParams.success) {
		return res.status(400).json({
			error: 'invalid request parameters',
			details: treatedParams.error.issues,
		});
	}

	const { id } = treatedParams.data;

	const { result, error } = await query(() => friendsService.delFriend(user.id, id));
	if (error) {
		const treatedErr = treatError(error);
		return res.status(treatedErr.status).json(treatedErr.error);
	}
	
	if (!result)
		return res.status(404).json({ error: 'user not found' });

	return res.status(204).send();
}
