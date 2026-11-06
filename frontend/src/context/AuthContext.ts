import { createContext, useContext } from 'react'
import type { AuthUser } from '../types/auth'

type AuthContextValue = {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
    const context = useContext(AuthContext)

    if (context === null) {
        throw new Error('useAuth must be used inside AuthProvider.')
    }

    return context
}