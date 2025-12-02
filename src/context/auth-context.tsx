import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { checkAuth, saveAuth } from '@/utils/auth'
import { getLoginPath } from '@/lib/api'

// 用户类型定义
interface User {
  id: string;
  username: string;
  avatar?: string;
  [key: string]: any;
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  login: (token: string, user: any) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading] = useState<boolean>(true)
  const [token, setToken] = useState<string | null>(null)

  // 初始化时检查认证状态
  useEffect(() => {
    const auth = checkAuth()
    if (auth) {
      setUser(auth.user)
      setToken(auth.token)
      setIsAuthenticated(true)
    }
  }, [])

  // 登录函数
  const login = (token: string, user: any) => {
    setUser(user)
    setToken(token)
    setIsAuthenticated(true)
    saveAuth(token, user)
  }

  // 注销函数
  const logout = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // 使用getLoginPath获取正确的登录路径
    const loginPath = getLoginPath()
    console.log('退出跳转路径:', loginPath)
    window.location.href = loginPath
  }, [])

  const value = {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// 自定义钩子，用于在组件中访问认证上下文
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 