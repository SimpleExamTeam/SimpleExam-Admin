'use client'

import { useState } from 'react'
import { IconAlertTriangle, IconUserX } from '@tabler/icons-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { User } from '../data/schema'
import { usersApi } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { useUsers } from '../context/users-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  BlurDialog, 
  BlurDialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/blur-dialog'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const [value, setValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { fetchUsers } = useUsers()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.username) return
    
    setIsSubmitting(true)
    try {
      const response = await usersApi.deleteUser(currentRow.id) as any
      
      if (response.code === 200) {
        toast({
          title: "用户已删除",
          description: `用户 "${currentRow.username}" 已被成功删除`,
        })
        fetchUsers()
      } else {
        toast({
          variant: "destructive",
          title: "删除用户失败",
          description: response.message || "删除用户时出现错误",
        })
      }
    } catch (error) {
      console.error('删除用户错误:', error)
      toast({
        variant: "destructive",
        title: "删除用户失败",
        description: "删除用户时出现错误",
      })
    } finally {
      setIsSubmitting(false)
      onOpenChange(false)
    }
  }

  return (
    <BlurDialog open={open} onOpenChange={onOpenChange}>
      <BlurDialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            <span className='text-destructive flex items-center'>
              <IconUserX
                className='stroke-destructive mr-2'
                size={22}
              />
              删除用户
            </span>
          </DialogTitle>
          <DialogDescription asChild>
            <div className='space-y-4'>
              <div className='flex items-center space-x-4 border p-4 rounded-lg bg-muted/30'>
                <Avatar className="h-16 w-16">
                  <AvatarImage src={currentRow.avatar} alt={currentRow.nickname} />
                  <AvatarFallback>{currentRow.nickname?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <div className='flex items-center gap-2'>
                    <p className='font-bold text-lg'>{currentRow.nickname}</p>
                    <Badge variant={currentRow.is_admin ? 'default' : 'secondary'}>
                      {currentRow.is_admin ? '管理员' : '普通用户'}
                    </Badge>
                  </div>
                  <p className='text-muted-foreground'>{currentRow.username}</p>
                </div>
              </div>

              <Alert variant='destructive' className='border-2'>
                <AlertTitle className='flex items-center gap-1 text-base'>
                  <IconAlertTriangle className='h-5 w-5' />
                  永久删除警告
                </AlertTitle>
                <AlertDescription className='mt-2'>
                  此操作将永久删除该用户的所有数据，包括个人信息和相关记录。此操作无法撤销。
                </AlertDescription>
              </Alert>

              <div className='mt-4 space-y-2'>
                <Label htmlFor='confirm-username'>
                  请输入用户名 <span className='font-bold text-destructive'>{currentRow.username}</span> 确认删除：
                </Label>
                <Input
                  id='confirm-username'
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={currentRow.username}
                  className={`border-2 ${value && value !== currentRow.username ? 'border-destructive' : ''}`}
                />
                {value && value !== currentRow.username && (
                  <p className='text-xs text-destructive'>用户名不匹配</p>
                )}
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="hover:bg-background/60 backdrop-blur-sm border-background/20"
          >
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={value.trim() !== currentRow.username || isSubmitting}
            className={cn(
              "text-white",
              isSubmitting && "opacity-80 pointer-events-none"
            )}
          >
            {isSubmitting ? '删除中...' : '确认删除'}
          </Button>
        </DialogFooter>
      </BlurDialogContent>
    </BlurDialog>
  )
}
