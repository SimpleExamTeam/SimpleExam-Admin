import { ColumnDef } from '@tanstack/react-table'
import { Question, QuestionType } from '../data/schema'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconDotsVertical, IconEdit, IconEye, IconTrash } from '@tabler/icons-react'
import { formatDate } from '@/lib/utils'

// 题目类型映射
const questionTypeMap = {
  [QuestionType.SINGLE]: { label: '单选题', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  [QuestionType.MULTIPLE]: { label: '多选题', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
  [QuestionType.JUDGE]: { label: '判断题', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
}

interface QuestionsColumnsProps {
  onView: (question: Question) => void
  onEdit: (question: Question) => void
  onDelete: (question: Question) => void
}

export function createColumns({
  onView,
  onEdit,
  onDelete,
}: QuestionsColumnsProps): ColumnDef<Question>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => {
        const isAllSelected = table.getIsAllPageRowsSelected();
        const isSomeSelected = table.getIsSomePageRowsSelected();
        const value = isAllSelected ? true : (isSomeSelected ? 'indeterminate' : false);
        
        return (
          <Checkbox
            checked={value}
            onCheckedChange={(checked) => {
              if (checked === 'indeterminate') {
                table.toggleAllPageRowsSelected(false);
              } else {
                table.toggleAllPageRowsSelected(!!checked);
              }
            }}
            aria-label="选择所有"
          />
        );
      },
      cell: ({ row }) => {
        const isSelected = row.getIsSelected();
        
        return (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => {
              row.toggleSelected(!!checked);
            }}
            aria-label="选择行"
            onClick={(e) => e.stopPropagation()}
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <div className="font-medium">{row.getValue('id')}</div>,
    },
    {
      accessorKey: 'question',
      header: '题目内容',
      cell: ({ row }) => (
        <div className="max-w-[500px] truncate" title={row.getValue('question')}>
          {row.getValue('question')}
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: '题目类型',
      cell: ({ row }) => {
        const type = row.getValue('type') as QuestionType
        const typeInfo = questionTypeMap[type] || { label: type, color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' }
        const typeDesc = row.original.type_desc || typeInfo.label
        
        return (
          <Badge variant="outline" className={`${typeInfo.color} border-none`}>
            {typeDesc}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'course_name',
      header: '所属课程',
      cell: ({ row }) => <div>{row.getValue('course_name')}</div>,
    },
    {
      accessorKey: 'created_at',
      header: '创建时间',
      cell: ({ row }) => <div>{formatDate(row.getValue('created_at'))}</div>,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const question = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="sr-only">打开菜单</span>
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onView(question);
              }}>
                <IconEye className="mr-2 h-4 w-4" />
                查看
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onEdit(question);
              }}>
                <IconEdit className="mr-2 h-4 w-4" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(question);
                }}
                className="text-destructive focus:text-destructive"
              >
                <IconTrash className="mr-2 h-4 w-4" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
} 