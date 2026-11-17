import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthUser } from '../types/auth'
import { AuthContext } from './AuthContext'
import realtimeSocket, { type RealtimeEvent } from '../services/websocket'

function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)

    useEffect(() => {
        if (!user) return
        const userId = user.id

        function handleEvent(event: RealtimeEvent) {
            if (event.type !== 'stats.updated' || !event.stats ||
                typeof event.stats !== 'object') return
            const stats = event.stats as Record<string, unknown>
            if (stats.userId !== userId ||
                typeof stats.elo !== 'number' ||
                typeof stats.gamesPlayed !== 'number' ||
                typeof stats.maxElo !== 'number') return
            setUser((current) => current && current.id === userId
                ? {
                    ...current,
                    elo: stats.elo as number,
                    gamesPlayed: stats.gamesPlayed as number,
                    maxElo: stats.maxElo as number,
                }
                : current)
        }

        return realtimeSocket.subscribe(handleEvent)
    }, [user?.id])

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider