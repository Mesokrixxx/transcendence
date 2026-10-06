import { type Request, type Response } from 'express';
import { parseCookie, stringifySetCookie } from 'cookie';
import * as userService from '../services/users.service.js';
import * as authService from '../services/auth.service.js';
import { authUserSchema } from '../validations/users.validation.js';
import { query } from '../utils/query.js';
import { treatError } from '../utils/errors.js';

function sessionCookie(token: string, maxAge: number) {
	return stringifySetCookie({
		name: authService.SESSION_COOKIE,
		value: token,
		httpOnly: true,
		maxAge,
		path: '/',
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production'
	});
}

export async function login(req: Request, res: Response) {
	const treatedReq = authUserSchema.safeParse(req.body);
	if (!treatedReq.success) {
		return res.status(400).json({
			error: 'Invalid request body',
			details: treatedReq.error.issues
		});
	}

	const { email, password } = treatedReq.data;
	const { result: user, error: authError } = await query(() => userService.auth(email, password));
	if (authError) {
		const treatedErr = treatError(authError);
		return res.status(treatedErr.status).json(treatedErr.error);
	}

	if (!user)
		return res.status(401).json({ error: 'Invalid credentials' });

	const { result: session, error: sessionError } = await query(() => authService.createSession(user.id));
	if (sessionError) {
		const treatedErr = treatError(sessionError);
		return res.status(treatedErr.status).json(treatedErr.error);
	}
	if (!session)
		return res.status(500).json({ error: 'session creation failed' });

	res.setHeader(
		'Set-Cookie',
		sessionCookie(session.token, authService.SESSION_DURATION_SECONDS)
	);
	return res.status(200).json(user);
}

export async function logout(req: Request, res: Response) {
	const cookieHeader = req.headers.cookie;
	const token = cookieHeader ? parseCookie(cookieHeader)[authService.SESSION_COOKIE] ?? null : null;
	if (token) {
		const { error } = await query(() => authService.deleteSession(token));
		if (error) {
			const treatedErr = treatError(error);
			return res.status(treatedErr.status).json(treatedErr.error);
		}
	}

	res.setHeader('Set-Cookie', sessionCookie('', 0));
	return res.status(204).send();
}
