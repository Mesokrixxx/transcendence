interface GithubUser {
  id: number;
  login: string;
  email: string;
}

async function getAccessToken(code: string): Promise<string | null> {
  try {
    const client_id = process.env.OAUTH_CLIENT_ID;
    const client_secret = process.env.OAUTH_CLIENT_SECRET;
    const redirect_uri = process.env.OAUTH_REDIRECT_URI;
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'post',
      headers: {
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        client_id: client_id!,
        client_secret: client_secret!,
        code,
        redirect_uri: redirect_uri!,
      }),
    });
    if (!res.ok) return null;
    const { access_token } = await res.json();
    if (typeof access_token !== 'string') return null;
    return access_token;
  } catch {
    return null;
  }
}

async function getGithubUser(code: string): Promise<GithubUser | null> {
  const access_token = await getAccessToken(code);
  if (access_token === null) return null;
  try {
    let res = await fetch(`https://api.github.com/user`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (res.status !== 200) return null;
    const userData = await res.json();
    if (typeof userData.login !== 'string' || typeof userData.id !== 'number')
      return null;
    res = await fetch(`https://api.github.com/user/emails`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (res.status !== 200) return null;
    const emailData = await res.json();
    if (!Array.isArray(emailData)) return null;
    const userEmail = emailData.find(
      (e) => e.primary && e.verified && typeof e.email === 'string',
    );
    if (!userEmail) return null;
    return {
      id: userData.id,
      login: userData.login,
      email: userEmail.email,
    };
  } catch {
    return null;
  }
}

export { getGithubUser };
