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
import { Card } from '../data/schema'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'

// 定义一个类型来保存我们在列定义中可能需要的回调函数
export interface CardActionHandlers {
  onView?: (card: Card) => void
  onEdit?: (card: Card) => void
  onDelete?: (card: Card) => void
}

// 创建一个生成列定义的函数，接收回调函数作为参数
export const createColumns = (actionHandlers?: CardActionHandlers): ColumnDef<Card>[] => {
  // 使用闭包创建一个复制函数，避免在单元格中直接使用 useToast
  const CopyCardNo = ({ card }: { card: Card }) => {
    const { toast } = useToast();
    
    const handleCopyCardNo = (e: React.MouseEvent) => {
      e.stopPropagation(); // 阻止事件冒泡
      navigator.clipboard.writeText(card.card_no)
        .then(() => {
          toast({
            title: "复制成功",
            description: `卡券号 ${card.card_no} 已复制到剪贴板`,
            duration: 2000,
          });
        })
        .catch(() => {
          toast({
            title: "复制失败",
            description: "无法复制到剪贴板，请手动复制",
            variant: "destructive",
          });
        });
    };
    
    return (
      <DropdownMenuItem onClick={handleCopyCardNo}>
        复制卡券号
      </DropdownMenuItem>
    );
  };
  
  return [
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
      accessorKey: 'card_no',
      header: '卡券号',
      cell: ({ row }) => <div className="font-medium">{row.getValue('card_no')}</div>,
    },
    {
      accessorKey: 'course_name',
      header: '课程',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('course_name')}</div>
      ),
    },
    {
      accessorKey: 'amount',
      header: '金额',
      cell: ({ row }) => (
        <div className="font-medium">¥{(row.getValue('amount') as number).toFixed(2)}</div>
      ),
    },
    {
      id: 'usage',
      header: '使用情况',
      cell: ({ row }) => {
        const total = row.original.total;
        const used = row.original.used;
        return <div className="font-medium">{used}/{total}</div>;
      },
    },
    {
      accessorKey: 'expire_days',
      header: '有效期(天)',
      cell: ({ row }) => <div>{row.getValue('expire_days')}</div>,
    },
    {
      accessorKey: 'is_expired',
      header: '状态',
      cell: ({ row }) => {
        const isExpired = row.getValue('is_expired') as boolean;
        const variant = isExpired ? 'destructive' : 'default';
        const label = isExpired ? '已过期' : '有效';
        
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      accessorKey: 'created_at',
      header: '创建时间',
      cell: ({ row }) => <div>{formatDate(row.getValue('created_at'))}</div>,
    },
    {
      accessorKey: 'expire_time',
      header: '过期时间',
      cell: ({ row }) => <div>{formatDate(row.getValue('expire_time'))}</div>,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const card = row.original;

        return (
          <div data-prevent-row-click="true">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">打开菜单</span>
                  <IconDotsVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>操作</DropdownMenuLabel>
                <CopyCardNo card={card} />
                <DropdownMenuSeparator />
                {actionHandlers?.onView && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    actionHandlers.onView?.(card);
                  }}>
                    查看详情
                  </DropdownMenuItem>
                )}
                {actionHandlers?.onEdit && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    actionHandlers.onEdit?.(card);
                  }}>
                    编辑
                  </DropdownMenuItem>
                )}
                {actionHandlers?.onDelete && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      actionHandlers.onDelete?.(card);
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    删除
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
} 