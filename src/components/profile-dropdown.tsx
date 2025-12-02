import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { authApi } from '@/lib/api'
import { useAuth } from '@/context/auth-context'

interface UserInfo {
  id: string | number
  username: string
  nickname: string
  avatar?: string
}

export function ProfileDropdown() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const { user: authUser } = useAuth()

  // 监听用户信息变化，包括authUser和localStorage
  useEffect(() => {
    const updateUserInfo = () => {
      // 尝试从localStorage获取最新用户信息
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          setUserInfo(user)
        } catch (error) {
          console.error('Failed to parse user info', error)
        }
      } else if (authUser) {
        // 如果localStorage中没有，但authContext中有
        setUserInfo({
          id: authUser.id,
          username: authUser.username,
          nickname: authUser.nickname,
          avatar: authUser.avatar || '' // 提供默认值，避免undefined
        })
      }
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
  }, [authUser])

  const handleLogout = () => {
    authApi.logout()
  }

  // 如果没有用户信息，显示默认头像
  if (!userInfo) {
    return (
      <Avatar className='h-8 w-8'>
        <AvatarFallback>用户</AvatarFallback>
      </Avatar>
    )
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="outline-none focus:outline-none">
        <Avatar className='h-8 w-8 cursor-pointer'>
          <AvatarImage src={userInfo.avatar} alt={userInfo.nickname} />
          <AvatarFallback>{userInfo.nickname?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm leading-none font-medium'>{userInfo.nickname}</p>
            <p className='text-muted-foreground text-xs leading-none'>
              {userInfo.username}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to='/settings'>
              个人资料
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to='/settings/appearance'>
              外观
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          退出登录
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
