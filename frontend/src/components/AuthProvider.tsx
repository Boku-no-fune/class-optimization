import { useState, useCallback, type ReactNode } from 'react'
import { AuthContext } from '@/hooks/useAuth'
import { authApi } from '@/api/auth'
import type { User } from '@/types'

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('auth_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'))

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password })
    const authToken = res.headers['authorization']?.replace('Bearer ', '') ?? ''
    const userData = res.data.user
    localStorage.setItem('auth_token', authToken)
    localStorage.setItem('auth_user', JSON.stringify(userData))
    setToken(authToken)
    setUser(userData)
  }, [])

  const logout = useCallback(async () => {
    try { await authApi.logout() } catch {}
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAdmin: user?.role === 'admin',
      isTeacher: user?.role === 'teacher',
    }}>
      {children}
    </AuthContext.Provider>
  )
}
