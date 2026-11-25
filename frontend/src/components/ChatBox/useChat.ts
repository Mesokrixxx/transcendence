import { useEffect, useState } from 'react'
import realtimeSocket, { type RealtimeEvent } from '../../services/websocket'
import {
    getMessages,
    toChatMessage,
    type ChatMessage,
    type MessageFromAPI
} from './Chats.services'

function isMessageFromAPI(value: unknown): value is MessageFromAPI {
    return (
        typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'content' in value &&
        'userId' in value &&
        typeof value.id === 'number' &&
        typeof value.content === 'string' &&
        typeof value.userId === 'number'
    )
}

function mergeMessages(current: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
    const byId = new Map(
        current.map((message): [number, ChatMessage] => [message.id, message])
    )

    for (const message of incoming) {
        byId.set(message.id, message)
    }

    return [...byId.values()].sort((a, b) => a.id - b.id)
}

type ChatState = {
    chatId: number | undefined
    messages: ChatMessage[]
    isLoading: boolean
    hasError: boolean
}

function initialState(chatId: number | undefined): ChatState {
    return { chatId, messages: [], isLoading: chatId !== undefined, hasError: false }
}

export function useChat(chatId: number | undefined) {
    const [state, setState] = useState<ChatState>(() => initialState(chatId))

    // When chatId changes, reset during render (no stale messages from the previous chat).
    if (state.chatId !== chatId) {
        setState(initialState(chatId))
    }

    useEffect(() => {
        if (chatId === undefined) return

        let isActive = true

        function update(change: (current: ChatState) => Partial<ChatState>) {
            if (!isActive) return
            setState((current) =>
                current.chatId === chatId ? { ...current, ...change(current) } : current
            )
        }

        const loadHistory = () => {
            getMessages(chatId)
                .then((history) =>
                    update((current) => ({
                        messages: mergeMessages(current.messages, history),
                        isLoading: false,
                        hasError: false,
                    }))
                )
                .catch(() =>
                    update((current) => ({
                        hasError: current.isLoading || current.hasError,
                        isLoading: false,
                    }))
                )
        }

        loadHistory()

        // Shared socket: reconnects automatically and re-joins the chat.
        function handleEvent(event: RealtimeEvent) {
            if (event.type === 'profile.changed' &&
                typeof event.userId === 'number' &&
                typeof event.username === 'string') {
                const name =
                    typeof event.displayName === 'string'
                        ? event.displayName.trim() || event.username
                        : event.username
                update((current) => ({
                    messages: current.messages.map((message) =>
                        message.userId === event.userId
                            ? { ...message, username: name }
                            : message
                    ),
                }))
                return
            }

            if (event.type === 'chat.joined' && event.chatId === chatId) {
                loadHistory()
                return
            }

            if (event.type !== 'chat.message' || event.chatId !== chatId) return
            if (!isMessageFromAPI(event.message)) return

            const incoming = toChatMessage(event.message, new Map())
            update((current) => ({ messages: mergeMessages(current.messages, [incoming]) }))
        }

        const leaveChat = realtimeSocket.joinChat(chatId, handleEvent)

        return () => {
            isActive = false
            leaveChat()
        }
    }, [chatId])

    // Adds a message right away (e.g. the one we just sent), without waiting for the socket.
    function addMessage(message: ChatMessage) {
        setState((current) => ({ ...current, messages: mergeMessages(current.messages, [message]) }))
    }

    const { messages, isLoading, hasError } = state
    return { messages, isLoading, hasError, addMessage }
}
