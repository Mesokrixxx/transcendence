import i18next from 'i18next';

/**
 * Maps the error messages sent by the backend to translation keys.
 *
 * The backend currently returns human-readable English messages (and a few
 * camelCase keys for avatars), so every message that can reach the UI must be
 * mapped here to keep the frontend fully translated.
 */
const backendErrorKeys = {
  'Invalid credentials': 'invalidCredentials',
  'authentication required': 'authenticationRequired',
  authenticationRequired: 'authenticationRequired',
  'invalid or expired session': 'sessionExpired',
  'user must be logged in': 'authenticationRequired',
  'session creation failed': 'serverError',
  'user creation failed': 'serverError',
  'unable to create GitHub user': 'serverError',
  'username already exists': 'usernameInUse',
  'email already exists': 'emailInUse',
  'value(s) already exists': 'usernameOrEmailInUse',
  'current password is incorrect': 'wrongPassword',
  'user not found': 'userNotFound',
  avatarRequired: 'avatarRequired',
  invalidAvatarFormat: 'invalidAvatarFormat',
  invalidAvatarImage: 'invalidAvatarImage',
  avatarChanged: 'avatarChanged',
  avatarUploadFailed: 'serverError',
  avatarRemovalFailed: 'serverError',
  'invalid game players': 'serverError',
  'game players not found': 'serverError',
  'stored game moves are invalid': 'serverError',
  'game result unavailable': 'serverError',
  'game not found': 'gameNotFound',
  'game is over': 'gameOver',
  'user is not a game player': 'notPlayer',
  'user is not a player in this game': 'notPlayer',
  'you are not a game player': 'notPlayer',
  "it is not this player's turn": 'notYourTurn',
  'illegal chess move': 'illegalMove',
  'invalid chess move': 'illegalMove',
  'no draw can be claimed': 'noDrawClaim',
  'draw offer not found': 'drawOfferNotFound',
  'invitation not found': 'invitationNotFound',
  'invitation could not be created': 'invitationCreateFailed',
  'invitation was declined': 'invitationDeclined',
  'invitation was already accepted': 'invitationAlreadyAccepted',
  'invitation is no longer pending': 'invitationNotPending',
  'you are not the invited player': 'notInvitedPlayer',
  'you cannot invite yourself': 'cannotInviteYourself',
  'game invitations require friendship': 'friendshipRequired',
  'cannot add yourself as a friend': 'cannotAddYourself',
  'friend request not found': 'friendRequestNotFound',
  'user is not a member of this chat': 'chatAccessDenied',
  'chat not found': 'chatNotFound',
  'badge not found': 'badgeNotFound',
  'a profile can feature at most 3 badges': 'badgeLimitReached',
  'featured must be a boolean': 'invalidRequest',
  'invalid badge code': 'invalidRequest',
  'id shall be an integer': 'invalidRequest',
  'id shall be a positive integer': 'invalidRequest',
  'friendId shall be a positive integer': 'invalidRequest',
  'Invalid body request': 'invalidRequest',
  'Invalid request body': 'invalidRequest',
} as const;

type BackendErrorMessage = keyof typeof backendErrorKeys;

function extractMessage(error: unknown): string {
  if (typeof error === 'string') return error;

  if (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof error.error === 'string'
  )
    return error.error;

  return '';
}

/**
 * Translates an API error into the current language.
 *
 * Unknown messages fall back to the provided translated message so that raw
 * English backend strings are never displayed to the user.
 *
 * @param error - The error returned by `fetchAPI` (string or `{ error }`).
 * @param fallback - An already-translated fallback message.
 * @returns A translated error message.
 */
export function translateApiError(error: unknown, fallback: string): string {
  const message = extractMessage(error);
  const key = backendErrorKeys[message as BackendErrorMessage];
  return key ? i18next.t(key, { ns: 'errors' }) : fallback;
}
