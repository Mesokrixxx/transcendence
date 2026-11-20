import { type Request, type Response } from 'express';
import { parseCookie, stringifySetCookie } from 'cookie';
import * as userService from '../services/users.service.js';
import * as authService from '../services/auth.service.js';
import { authUserSchema, createGithubUserSchema } from '../validations/users.validation.js';
import { query } from '../utils/query.js';
import { treatError } from '../utils/errors.js';
import { getGithubUser } from '../utils/github.js';

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

export function getCurrentUser(req: Request, res: Response) {
	if (!req.user)
		return res.status(401).json({ error: 'user must be logged in' });

	return res.status(200).json(req.user);
}

export async function oauth(req: Request, res: Response) {
  const { code } = req.query;
  if (typeof code !== 'string')
    return res.sendStatus(400);
  
  const githubUser = await getGithubUser(code);
  if (githubUser === null)
    return res.status(400).json('Github authentication failed');

  const { result: existingUser, error } = await query(() => userService.getGithubUser(githubUser.id));
  if (error) {
    const treatedErr = treatError(error);
    return res.status(treatedErr.status).json(treatedErr.error);
  }

  let user = existingUser;
  if (!user) {
    const treatedReq = createGithubUserSchema.safeParse({ username: githubUser.login, email: githubUser.email });
    if (!treatedReq.success) {
      return res.status(400).json({
        error: 'Invalid github user',
        details: treatedReq.error.issues
      });
    }

    const { username, email } = treatedReq.data;
    const { result, error } = await query(() => userService.createGithubUser(username, email, githubUser.id));
    if (error) {
      const treatedErr = treatError(error);

      return res.status(treatedErr.status).json(treatedErr.error);
    }
	  if (!result)
      return res.status(500).json({ error: 'user creation failed' });
    user = result;
  }

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
