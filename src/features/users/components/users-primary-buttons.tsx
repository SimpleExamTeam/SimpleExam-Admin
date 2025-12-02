import { IconRefresh, IconUserPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useUsers } from '../context/users-context'

interface UsersPrimaryButtonsProps {
  onRefresh?: () => void
}

export function UsersPrimaryButtons({ onRefresh }: UsersPrimaryButtonsProps) {
  const { setOpen, handleRefresh } = useUsers()
  
  return (
    <div className='flex gap-2'>
      <Button 
        className='space-x-1' 
        onClick={() => setOpen('add')}
      >
        <span>添加用户</span> <IconUserPlus size={18} />
      </Button>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={handleRefresh || onRefresh}
      >
        <span>刷新</span> <IconRefresh size={18} />
      </Button>
    </div>
  )
}
