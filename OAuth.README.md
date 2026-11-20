# ChessMove - OAuth 2.0

## GitHub Setup

To enable OAuth 2.0 authentication in ChessMove, a GitHub OAuth application has been registered by `nhoussie`.

Contact them to obtain the `client_id` and `client_secret` required to configure GitHub authentication.

The GitHub OAuth application must also have its Authorization callback URL configured to match the `OAUTH_REDIRECT_URI` used by ChessMove.

## App Setup

The application's `.env` file must contain the following variables:

| Variable | Description |
|---|---|
| `OAUTH_CLIENT_ID` | GitHub OAuth application's client ID |
| `OAUTH_CLIENT_SECRET` | GitHub OAuth application's client secret |
| `OAUTH_REDIRECT_URI` | Callback URL configured in the GitHub OAuth application |

The frontend also requires the following variables:

| Variable | Description |
|---|---|
| `VITE_OAUTH_CLIENT_ID` | GitHub OAuth application's client ID |
| `VITE_OAUTH_REDIRECT_URI` | Callback URL used by the frontend |

The `OAUTH_REDIRECT_URI` and `VITE_OAUTH_REDIRECT_URI` values must match exactly and correspond to the callback URL configured in the GitHub OAuth application.

The provided configuration should work without any changes after completing the `OAUTH_CLIENT_ID` and `OAUTH_CLIENT_SECRET` variables, provided the application runs on the expected ports and addresses. If these settings are changed, make sure to update all three redirect URI configurations accordingly.

**Important:** Never commit the `.env` file or expose the `OAUTH_CLIENT_SECRET`. The client secret must remain on the backend.

## Sign in with GitHub

Once the application is properly configured and running, a **GitHub Login** button should be available.

Clicking this button redirects you to GitHub, where you will be asked to authorize ChessMove to access the requested account information.

After granting authorization, GitHub redirects you back to ChessMove. If the authentication process succeeds, you will be redirected to the main page and logged in.

If the GitHub login button is unavailable or the authentication process fails, check that the environment variables are correctly configured and that the GitHub OAuth application settings match the application's configuration.

## How GitHub Authentication Works

ChessMove uses the OAuth 2.0 authorization code flow to authenticate users through GitHub.

The authentication process consists of the following steps:

1. **Authorization request:** When the user clicks the GitHub Login button, the frontend generates a unique `state` value and redirects the user to GitHub's authorization page. The requested permissions (scopes) are included in the authorization request.

2. **User authorization:** GitHub asks the user to authorize ChessMove to access the requested information. Once authorization is granted, GitHub redirects the user to the callback URL configured in the application, providing a temporary authorization `code` and the original `state` value.

3. **State validation:** The frontend validates the returned `state` against the value generated before the redirect. This helps ensure that the callback belongs to the original authentication request.

4. **Token exchange:** The frontend sends the authorization `code` to the backend. The backend then exchanges it for an `access_token` by making a POST request to GitHub's token endpoint.

5. **User information retrieval:** Using the obtained `access_token`, the backend queries the GitHub API to retrieve the user's profile information and primary verified email address.

6. **User authentication:** The backend uses the retrieved GitHub information to identify the user in ChessMove. If the user does not already have an account, one is created.

7. **Authentication completion:** Once the user has been successfully authenticated, the backend establishes their ChessMove session. The frontend can then update the current user state and display the authenticated application.
