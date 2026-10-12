import { type NextFunction, type Request, type Response } from 'express';
import { parseCookie } from 'cookie';
import * as authService from '../services/auth.service.js';
import { query } from '../utils/query.js';
import { treatError } from '../utils/errors.js';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
	const cookieHeader = req.headers.cookie;
	const token = cookieHeader
		? parseCookie(cookieHeader)[authService.SESSION_COOKIE] ?? null
		: null;

	if (!token)
		return res.status(401).json({ error: 'authentication required' });

	const { result: user, error } = await query(() => authService.getSession(token));
	if (error) {
		const treatedErr = treatError(error);
		return res.status(treatedErr.status).json(treatedErr.error);
	}

	if (!user)
		return res.status(401).json({ error: 'invalid or expired session' });

	req.user = user;
	return next();
}
