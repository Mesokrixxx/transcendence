import fetchAPI from "./fetchAPI"
import type { APIError } from "../types/fetch"

export type FriendUser = {
    id: number
    username: string
    displayName?: string | null
    avatar?: string
    isOnline?: boolean
}

export type FriendsData = {
    friends: FriendUser[]
    received: FriendUser[]
    sent: FriendUser[]
    blocked: FriendUser[]
}

type FriendsFromAPI = {
    id: number
    username: string
    displayName?: string | null
    avatar?: string
    status?: 'friend' | 'pending_outgoing' | 'pending_incoming'
    online?: boolean
}

function getErrorMessage(error: APIError): string {
    return typeof error === 'string' ? error : error.error
}

async function getAPIData<Data>(path: string): Promise<Data> {
    const response = await fetchAPI<Data>({
        path,
        method: 'get'
    })

    if (response.error) {
        throw new Error(getErrorMessage(response.result))
    }

    return response.result
}

async function sendAction(
    path: string,
    method: 'post' | 'delete',
    body?: object
): Promise<void> {
    const response = await fetchAPI<void>({
        path,
        method,
        body
    })

    if (response.error) {
        throw new Error(getErrorMessage(response.result))
    }
}

function toPerson(user: FriendsFromAPI): FriendUser {
    return {
        id: user.id,
        username: user.username,
        displayName: user.displayName ?? null,
        avatar: user.avatar || undefined
    }
}

function toFriend(user: FriendsFromAPI) : FriendUser {
    return { ...toPerson(user), isOnline: user.online ?? false}
}

export async function getFriends(): Promise<FriendsData> {
    const [relations, blockedUsers] = await Promise.all([
        getAPIData<FriendsFromAPI[]>('/friends/me'),
        getAPIData<FriendsFromAPI[]>('/friends/blocked'),
    ])

    return {
        friends: relations
            .filter(user => user.status === 'friend')
            .map(toFriend),
        received: relations
            .filter(user => user.status === 'pending_incoming')
            .map(toPerson),
        sent: relations
            .filter(user => user.status === 'pending_outgoing')
            .map(toPerson),

        blocked: blockedUsers.map(toPerson)
    }
}

export async function acceptFriendRequest(userId: number): Promise<void> {
    return sendAction(`/friends/${userId}/accept`, 'post')
}

export async function removeFriendRequest(userId: number): Promise<void> {
    return sendAction(`/friends/${userId}`, 'delete')
}

export async function removeFriend(userId: number): Promise<void> {
    return sendAction(`/friends/${userId}`, 'delete')
}

export async function blockUser(userId: number): Promise<void> {
    return sendAction(`/friends/${userId}/block`, 'post')
}

export async function unblockUser(userId: number): Promise<void> {
    return sendAction(`/friends/${userId}/block`, 'delete')
}

export async function sendFriendRequest(username: string): Promise<void> {
    return sendAction('/friends/requests', 'post', { username })
}