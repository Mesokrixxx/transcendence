import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthUser } from '../types/auth'
import { AuthContext } from './AuthContext'
import realtimeSocket, { type RealtimeEvent } from '../services/websocket'

function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)

    useEffect(() => {
        if (!user) return

        function handleProfileChange(event: RealtimeEvent) {
            if (
                event.type !== 'profile.changed' ||
                typeof event.userId !== 'number' ||
                typeof event.username !== 'string' ||
                (event.avatar !== null && typeof event.avatar !== 'string') ||
                (event.firstName !== null && typeof event.firstName !== 'string') ||
                (event.lastName !== null && typeof event.lastName !== 'string')
            ) return

            const userId = event.userId
            const username = event.username
            const avatar = event.avatar
            const firstName = event.firstName
            const lastName = event.lastName
            setUser((current) => current && current.id === userId
                ? {
                    ...current,
                    username,
                    avatar,
                    firstName,
                    lastName,
                }
                : current)
        }

        return realtimeSocket.subscribe(handleProfileChange)
    }, [user?.id])

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider