import { ColumnDef } from '@tanstack/react-table'
import { IconDotsVertical } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User } from '../data/schema'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { useUsers } from '../context/users-context'

export const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <div className="font-medium">{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'avatar',
    header: '头像',
    cell: ({ row }) => (
      <Avatar>
        <AvatarImage src={row.getValue('avatar')} alt={row.getValue('nickname')} />
        <AvatarFallback>{String(row.getValue('nickname') || '').charAt(0)}</AvatarFallback>
      </Avatar>
    ),
  },
  {
    accessorKey: 'username',
    header: '用户名',
    cell: ({ row }) => <div>{row.getValue('username')}</div>,
  },
  {
    accessorKey: 'nickname',
    header: '昵称',
    cell: ({ row }) => <div>{row.getValue('nickname')}</div>,
  },
  {
    accessorKey: 'is_admin',
    header: '权限',
    cell: ({ row }) => {
      const isAdmin = row.getValue('is_admin')
      return (
        <Badge variant={isAdmin ? "default" : "outline"}>
          {isAdmin ? "Admin" : "User"}
          </Badge>
      )
    },
  },
  {
    accessorKey: 'created_at',
    header: '创建时间',
    cell: ({ row }) => <div>{formatDate(row.getValue('created_at'))}</div>,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original
      const { setOpen, setCurrentRow } = useUsers()

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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.id.toString())}
            >
              复制用户ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {
              setCurrentRow(user)
              setOpen('view')
            }}>
              查看详细信息
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setCurrentRow(user)
              setOpen('edit')
            }}>
              编辑用户
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => {
                setCurrentRow(user)
                setOpen('delete')
              }}
              className="text-destructive"
            >
              删除用户
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
