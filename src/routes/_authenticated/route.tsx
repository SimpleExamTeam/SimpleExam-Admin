import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { checkAuth } from '@/utils/auth'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
  beforeLoad: async () => {
    // 检查用户是否已登录
    const auth = checkAuth()

    if (!auth) {
      // 用户未登录，重定向到登录页面
      throw redirect({
        to: '/sign-in',
        replace: true,
      })
    }

    // 返回用户信息以供页面使用
    return {
      user: auth.user,
    }
  },
})
