export type FriendUser = {
    id: number
    username: string
    avatar?: string
    isOnline?: boolean
}

export type FriendsData = {
    friends: FriendUser[]
    received: FriendUser[]
    sent: FriendUser[]
    blocked: FriendUser[]
}

const fakeData: FriendsData = {
    friends: [
        {id: 1, username: 'alice', avatar: '/avatars/rook.svg', isOnline: true},
        {id: 2, username: 'bob', avatar: '/avatars/knight.svg', isOnline: false},
    ],
    received: [{id: 3, username: 'charlie', avatar: '/avatars/pawn.svg'}],
    sent: [{id: 4, username: 'diana'}],
    blocked: [{id: 5, username: 'sophia'}],
}

function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getFriends(): Promise<FriendsData> {
    await wait(500)
    return fakeData
}

export async function sendFriendRequest(username: string): Promise<FriendUser> {
    await wait(500)

    if (username.toLocaleLowerCase() === 'nobody') {
        throw new Error('User not found')
    }

    return { id: Date.now(), username}
}

export async function acceptFriendRequest(_userId: number): Promise<void> {
    await wait(300)
}

export async function removeFriendRequest(_userId: number): Promise<void> {
    await wait(300)
}

export async function removeFriend(_userId: number): Promise<void> {
    await wait(300)
}

export async function blockUser(_userId: number): Promise<void> {
    await wait(300)
}

export async function unblockUser(_userId: number): Promise<void> {
    await wait(300)
}