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
import { Course } from '../data/schema'
import { Badge } from '@/components/ui/badge'

// 定义一个类型来保存我们在列定义中可能需要的回调函数
export interface CourseActionHandlers {
  onEdit?: (course: Course) => void
  onDelete?: (course: Course) => void
  onPublish?: (course: Course) => void
  onArchive?: (course: Course) => void
  onViewDetails?: (course: Course) => void
}

// 创建一个生成列定义的函数，接收回调函数作为参数
export const createColumns = (actionHandlers?: CourseActionHandlers): ColumnDef<Course>[] => [
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
    accessorKey: 'category_level1',
    header: '类别',
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('category_level1')}</div>
    ),
  },
  {
    accessorKey: 'category_level2',
    header: '二级分类',
    cell: ({ row }) => (
      <div>
        <Badge variant="outline">
          {row.getValue('category_level2')}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: 'name',
    header: '课程名称',
    cell: ({ row }) => (
      <div 
        className="font-medium cursor-pointer hover:text-primary"
        onClick={() => actionHandlers?.onViewDetails?.(row.original)}
      >
        {row.getValue('name')}
      </div>
    ),
  },
  {
    accessorKey: 'cover',
    header: '封面',
    cell: ({ row }) => (
      <div 
        className="h-12 w-20 overflow-hidden rounded-md cursor-pointer"
        onClick={() => actionHandlers?.onViewDetails?.(row.original)}
      >
        <img 
          src={row.getValue('cover')} 
          alt={`${row.getValue('name')} cover`} 
          className="h-full w-full object-cover transition-transform hover:scale-110"
        />
      </div>
    ),
  },
  {
    accessorKey: 'price',
    header: '价格',
    cell: ({ row }) => (
      <div className="font-medium">¥{(row.getValue('price') as number).toFixed(2)}</div>
    ),
  },
  {
    accessorKey: 'expire_days',
    header: '有效期(天)',
    cell: ({ row }) => <div>{row.getValue('expire_days')}</div>,
  },
  {
    accessorKey: 'sort',
    header: '类别排序',
    cell: ({ row }) => <div>{row.getValue('sort')}</div>,
  },
  {
    accessorKey: 'category_sort1',
    header: '二级分类排序',
    cell: ({ row }) => <div>{row.getValue('category_sort1')}</div>,
  },
  {
    accessorKey: 'category_sort2',
    header: '课程排序',
    cell: ({ row }) => <div>{row.getValue('category_sort2')}</div>,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const course = row.original

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
              onClick={() => actionHandlers?.onViewDetails?.(course)}
            >
              查看详情
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(course.id.toString())}
            >
              复制课程ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => actionHandlers?.onEdit?.(course)}
            >
              编辑课程
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => actionHandlers?.onPublish?.(course)}
            >
              发布课程
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => actionHandlers?.onArchive?.(course)}
            >
              下架课程
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => actionHandlers?.onDelete?.(course)}
            >
              删除课程
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// 导出默认列定义
export const columns = createColumns() 