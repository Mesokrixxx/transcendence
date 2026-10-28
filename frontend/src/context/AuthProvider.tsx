import { useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthUser } from '../types/auth'
import { AuthContext } from './AuthContext'

function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider