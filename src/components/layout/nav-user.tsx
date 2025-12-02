import { Link } from '@tanstack/react-router'
import {
  BadgeCheck,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useAuth } from '@/context/auth-context'
import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { authApi } from '@/lib/api'

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const { user: authUser } = useAuth()
  const [showProDialog, setShowProDialog] = useState(false)
  const [localUser, setLocalUser] = useState({
    displayName: '',
    displayEmail: '',
    displayAvatar: ''
  })
  
  // 监听用户信息变化，包括authUser和localStorage
  useEffect(() => {
    const updateUserInfo = () => {
      // 尝试从localStorage获取最新用户信息
      const userFromStorage = localStorage.getItem('user')
      let storageUser = null
      
      if (userFromStorage) {
        try {
          storageUser = JSON.parse(userFromStorage)
        } catch (e) {
          console.error('Failed to parse user from localStorage', e)
        }
      }
      
      // 优先使用认证上下文中的用户信息，然后是localStorage，最后是props
      const displayName = authUser?.nickname || storageUser?.nickname || user.name
      const displayEmail = authUser?.username || storageUser?.username || user.email
      const displayAvatar = authUser?.avatar || storageUser?.avatar || user.avatar
      
      setLocalUser({
        displayName,
        displayEmail,
        displayAvatar
      })
    }
    
    // 初始化用户信息
    updateUserInfo()
    
    // 添加storage事件监听器，当localStorage变化时更新
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        updateUserInfo()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // 创建一个定时器定期检查用户信息变化
    const intervalId = setInterval(updateUserInfo, 1000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(intervalId)
    }
  }, [authUser, user])

  const handleLogout = () => {
    authApi.logout()
  }

  const handleProUpgrade = () => {
    setShowProDialog(true)
  }

  return (
    <>
      <Dialog open={showProDialog} onOpenChange={setShowProDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>升级到专业版</DialogTitle>
            <DialogDescription>
              请通过以下方式联系作者获取专业版
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <div className="text-center">
              <p className="text-lg font-medium">微信：levywang94</p>
              <p className="text-sm text-muted-foreground mt-2">扫描添加或搜索微信号联系</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage src={localUser.displayAvatar} alt={localUser.displayName} />
                  <AvatarFallback className='rounded-lg'>
                    {localUser.displayName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>{localUser.displayName}</span>
                  <span className='truncate text-xs'>{localUser.displayEmail}</span>
                </div>
                <ChevronsUpDown className='ml-auto size-4' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
              side={isMobile ? 'bottom' : 'right'}
              align='end'
              sideOffset={4}
            >
              <DropdownMenuLabel className='p-0 font-normal'>
                <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                  <Avatar className='h-8 w-8 rounded-lg'>
                    <AvatarImage src={localUser.displayAvatar} alt={localUser.displayName} />
                    <AvatarFallback className='rounded-lg'>
                      {localUser.displayName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-semibold'>{localUser.displayName}</span>
                    <span className='truncate text-xs'>{localUser.displayEmail}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleProUpgrade}>
                  <Sparkles />
                  升级到专业版
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link to='/settings'>
                    <BadgeCheck />
                    个人资料
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to='/settings/appearance'>
                    <CreditCard />
                    外观
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  )
}
