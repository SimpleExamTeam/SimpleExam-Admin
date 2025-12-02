import { createFileRoute, redirect } from '@tanstack/react-router'
import SignUp from '@/features/auth/sign-up'
import { isAuthenticated } from '@/utils/auth'

export const Route = createFileRoute('/(auth)/sign-up')({
  component: SignUp,
  beforeLoad: async () => {
    // 检查用户是否已登录
    if (isAuthenticated()) {
      // 用户已登录，重定向到首页
      throw redirect({
        to: '/',
        replace: true,
      })
    }
  },
})
