import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthUser } from '../types/auth'
import { AuthContext } from './AuthContext'
import realtimeSocket, { type RealtimeEvent } from '../services/websocket'

function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const sessionUserId = user?.id

    useEffect(() => {
        if (sessionUserId === undefined) return

        function handleEvent(event: RealtimeEvent) {
            if (event.type === 'profile.changed') {
                const { userId, username, avatar, firstName, lastName } = event

                if (
                    userId !== sessionUserId ||
                    typeof username !== 'string' ||
                    (avatar !== null && typeof avatar !== 'string') ||
                    (firstName !== null && typeof firstName !== 'string') ||
                    (lastName !== null && typeof lastName !== 'string')
                ) return

                setUser((current) => current && current.id === sessionUserId
                    ? { ...current, username, avatar, firstName, lastName }
                    : current)

                return
            }

            if (
                event.type !== 'stats.updated' ||
                !event.stats ||
                typeof event.stats !== 'object'
            ) return

            const { userId, elo, gamesPlayed, maxElo } =
                event.stats as Record<string, unknown>

            if (
                userId !== sessionUserId ||
                typeof elo !== 'number' ||
                typeof gamesPlayed !== 'number' ||
                typeof maxElo !== 'number'
            ) return

            setUser((current) => current && current.id === sessionUserId
                ? { ...current, elo, gamesPlayed, maxElo }
                : current)
        }

        return realtimeSocket.subscribe(handleEvent)
    }, [sessionUserId])

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider