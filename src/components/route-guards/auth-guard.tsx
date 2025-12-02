import { ReactNode } from 'react'
import { Navigate } from '@tanstack/react-router'
import { isAuthenticated } from '@/utils/auth'

interface AuthGuardProps {
  children: ReactNode
  requireAuth?: boolean
}

/**
 * 认证路由守卫组件
 * @param children 子组件
 * @param requireAuth 是否需要认证，默认为true
 * @returns 如果认证状态符合要求，返回子组件；否则重定向到相应页面
 */
export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const authenticated = isAuthenticated()

  // 需要认证但未登录，重定向到登录页
  if (requireAuth && !authenticated) {
    return <Navigate to="/sign-in" />
  }

  // 不需要认证但已登录，重定向到首页
  if (!requireAuth && authenticated) {
    return <Navigate to="/" />
  }

  // 认证状态符合要求，返回子组件
  return <>{children}</>
} 