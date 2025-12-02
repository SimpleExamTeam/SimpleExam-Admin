import { Checkbox } from '@/components/ui/checkbox'
import { ColumnDef } from '@tanstack/react-table'
import { Feedback } from '../data/schema'
import { Badge } from '@/components/ui/badge'
import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { IconDotsVertical } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import LongText from '@/components/long-text'

// 操作接口定义
interface ActionsProps {
  onView?: (feedback: Feedback) => void
  onReply?: (feedback: Feedback) => void
  onDelete?: (feedback: Feedback) => void
}

// 创建表格列定义
export const createColumns = ({ onView, onReply, onDelete }: ActionsProps): ColumnDef<Feedback>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || 
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='全选'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='选择行'
        className="data-[state=checked]:bg-primary"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <div>{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'user',
    header: '用户信息',
    cell: ({ row }) => {
      const user = row.getValue('user') as Feedback['user']
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{user.nickname?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.nickname}</div>
            <div className="text-xs text-muted-foreground">{user.username}</div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'feedback_content',
    header: '反馈内容',
    cell: ({ row }) => {
      const content = row.getValue('feedback_content') as string
      // 截断长文本，只显示前50个字符
      const displayText = content.length > 50 ? `${content.substring(0, 50)}...` : content
      return <LongText>{displayText}</LongText>
    },
  },
  {
    accessorKey: 'reply_content',
    header: '回复内容',
    cell: ({ row }) => {
      const content = row.getValue('reply_content') as string | undefined
      if (!content) return <span className="text-muted-foreground text-sm">暂无回复</span>
      
      // 截断长文本，只显示前50个字符
      const displayText = content.length > 50 ? `${content.substring(0, 50)}...` : content
      return <LongText>{displayText}</LongText>
    },
  },
  {
    accessorKey: 'status',
    header: '状态',
    cell: ({ row }) => {
      const status = row.getValue('status') as number
      return (
        <Badge variant={status === 0 ? 'outline' : 'default'}>
          {status === 0 ? '未确认' : '已确认'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'created_at',
    header: '提交时间',
    cell: ({ row }) => {
      const date = parseISO(row.getValue('created_at') as string)
      return <div>{format(date, 'yyyy-MM-dd HH:mm', { locale: zhCN })}</div>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const feedback = row.original
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>打开菜单</span>
              <IconDotsVertical className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>操作</DropdownMenuLabel>
            {onView && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onView(feedback)
                }}
              >
                查看详情
              </DropdownMenuItem>
            )}
            {onReply && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onReply(feedback)
                }}
              >
                回复反馈
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(feedback)
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  删除反馈
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 