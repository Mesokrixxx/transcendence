import fetchAPI from "../../services/fetchAPI"
import type { APIError } from "../../types/fetch"

//what the interface want
export type ChatMessage = {
    id: number
    content: string
    createdAt: string
    userId: number
    username: string
}

//what we have from the back
export type MessageFromAPI = {
    id: number
    content: string
    creationDate: string
    userId: number
    user?: { id: number; username: string }
}

type ChatFromAPI = {
    id: number
    messages: MessageFromAPI[]
    users: { id: number; username: string}[]
}

function getErrorMessage(error: APIError): string {
    return typeof error === 'string' ? error : error.error
}

export function toChatMessage(
    message: MessageFromAPI,
    usernames: Map<number, string>
): ChatMessage {
    return {
        id: message.id,
        content: message.content,
        createdAt: message.creationDate,
        userId:message.userId,
        username: message.user?.username ?? usernames.get(message.userId) ?? '?',
    }
}

export async function getMessages(chatId: number): Promise<ChatMessage[]> {
    const response= await fetchAPI<ChatFromAPI>({
        path: `/chats/${chatId}`,
        method: 'get',
    })

    if (response.error){
        throw new Error(getErrorMessage(response.result))
    }

    const usernames = new Map(
        response.result.users.map((user): [number, string] => [user.id, user.username])
    )

    return response.result.messages.map((message) => toChatMessage(message, usernames))
}

export async function sendMessage(chatId: number, message: string): Promise<ChatMessage> {
    const response = await fetchAPI<MessageFromAPI>({
        path: `/chats/${chatId}`,
        method: 'put',
        body: { message },
    })

    if (response.error) {
        throw new Error(getErrorMessage(response.result))
    }

    return toChatMessage(response.result, new Map())
}
