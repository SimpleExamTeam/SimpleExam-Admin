import Cookies from 'js-cookie'
import { Outlet, useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import SkipToMain from '@/components/skip-to-main'
import { useAuth } from '@/context/auth-context'
import { useEffect } from 'react'

interface Props {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: Props) {
  const defaultOpen = Cookies.get('sidebar_state') !== 'false'
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // 检查认证状态，如果未登录则重定向到登录页
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/sign-in', replace: true })
    }
  }, [isAuthenticated, navigate])

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <SkipToMain />
      <AppSidebar />
      <div
        id='content'
        className={cn(
          'ml-auto w-full max-w-full',
          'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
          'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
          'sm:transition-[width] sm:duration-200 sm:ease-linear',
          'flex h-svh flex-col',
          'group-data-[scroll-locked=1]/body:h-full',
          'has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh'
        )}
      >
        {children ? children : <Outlet />}
      </div>
    </SidebarProvider>
  )
}
