import { type Request, type Response } from 'express';
import * as friendsService from '../services/friends.service.js';
import { query } from '../utils/query.js';
import { treatError } from '../utils/errors.js';
import { isOnline } from '../services/presence.service.js';
import { friendParamsSchema } from '../validations/friends.validation.js';

function getFriendId(req: Request, res: Response) {
	const parsed = friendParamsSchema.safeParse(req.params);
	if (!parsed.success) {
		res.status(400).json({
			error: 'invalid request parameters',
			details: parsed.error.issues,
		});
		return null;
	}
	return parsed.data.id;
}

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

export async function getRequests(req: Request, res: Response) {
	if (!req.user)
		return res.status(401).json({ error: 'user must be logged in' });

	const { result, error } = await query(() =>
		friendsService.getRequests(req.user!.id),
	);
	if (error) {
		const treatedErr = treatError(error);
		return res.status(treatedErr.status).json(treatedErr.error);
	}
	if (!result)
		return res.status(404).json({ error: 'user not found' });

	return res.status(200).json(result.map((friend) => ({
		...friend,
		online: isOnline(friend.id),
	})));
}

export async function getBlocked(req: Request, res: Response) {
	if (!req.user)
		return res.status(401).json({ error: 'user must be logged in' });

	const { result, error } = await query(() =>
		friendsService.getBlocked(req.user!.id),
	);
	if (error) {
		const treatedErr = treatError(error);
		return res.status(treatedErr.status).json(treatedErr.error);
	}
	if (!result)
		return res.status(404).json({ error: 'user not found' });

	return res.status(200).json(result.map((friend) => ({
		...friend,
		online: isOnline(friend.id),
	})));
}

export async function addFriend(req: Request, res: Response) {
	const user = req.user;
	if (!user)
		return res.status(401).json({ error: 'user must be logged in' });

	const id = getFriendId(req, res);
	if (id === null) return;
	if (id === user.id)
		return res.status(400).json({ error: 'cannot add yourself as a friend' });

	const { result, error } = await query(() => friendsService.addFriend(user.id, id));
	if (error) {
		const treatedErr = treatError(error);
		return res.status(treatedErr.status).json(treatedErr.error);
	}

	if (!result) 
		return res.status(404).json({ error: 'user not found' });

	return res.status(201).json({ ...result, online: isOnline(result.id) });
}

export async function acceptFriend(req: Request, res: Response) {
	if (!req.user)
		return res.status(401).json({ error: 'user must be logged in' });

	const id = getFriendId(req, res);
	if (id === null) return;

	const { result, error } = await query(() =>
		friendsService.acceptFriend(req.user!.id, id),
	);
	if (error) {
		const treatedErr = treatError(error);
		return res.status(treatedErr.status).json(treatedErr.error);
	}
	if (!result)
		return res.status(404).json({ error: 'friend request not found' });

	return res.status(200).json({ ...result, online: isOnline(result.id) });
}

export async function delFriend(req: Request, res: Response) {
	const user = req.user;
	if (!user) 
		return res.status(401).json({ error: 'user must be logged in' });
	
	const id = getFriendId(req, res);
	if (id === null) return;

	const { result, error } = await query(() => friendsService.delFriend(user.id, id));
	if (error) {
		const treatedErr = treatError(error);
		return res.status(treatedErr.status).json(treatedErr.error);
	}
	
	if (!result)
		return res.status(404).json({ error: 'user not found' });

	return res.status(204).send();
}

export async function block(req: Request, res: Response) {
	if (!req.user)
		return res.status(401).json({ error: 'user must be logged in' });

	const id = getFriendId(req, res);
	if (id === null) return;

	const { result, error } = await query(() =>
		friendsService.block(req.user!.id, id),
	);
	if (error) {
		const treatedErr = treatError(error);
		return res.status(treatedErr.status).json(treatedErr.error);
	}
	if (!result)
		return res.status(404).json({ error: 'user not found' });

	return res.status(201).json({ ...result, online: isOnline(result.id) });
}

export async function unblock(req: Request, res: Response) {
	if (!req.user)
		return res.status(401).json({ error: 'user must be logged in' });

	const id = getFriendId(req, res);
	if (id === null) return;

	const { result, error } = await query(() =>
		friendsService.unblock(req.user!.id, id),
	);
	if (error) {
		const treatedErr = treatError(error);
		return res.status(treatedErr.status).json(treatedErr.error);
	}
	if (!result)
		return res.status(404).json({ error: 'user not found' });

	return res.status(204).send();
}
