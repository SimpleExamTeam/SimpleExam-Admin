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
import { Order } from '../data/schema'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'

// 定义一个类型来保存我们在列定义中可能需要的回调函数
export interface OrderActionHandlers {
  onView?: (order: Order) => void
  onDelete?: (order: Order) => void
  onRefund?: (order: Order) => void
}

// 创建一个生成列定义的函数，接收回调函数作为参数
export const createColumns = (actionHandlers?: OrderActionHandlers): ColumnDef<Order>[] => {
  // 使用闭包创建一个复制函数，避免在单元格中直接使用 useToast
  const CopyOrderNo = ({ order }: { order: Order }) => {
    const { toast } = useToast();
    
    const handleCopyOrderNo = (e: React.MouseEvent) => {
      e.stopPropagation(); // 阻止事件冒泡
      navigator.clipboard.writeText(order.order_no)
        .then(() => {
          toast({
            title: "复制成功",
            description: `订单号 ${order.order_no} 已复制到剪贴板`,
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
      <DropdownMenuItem onClick={handleCopyOrderNo}>
        复制订单号
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
      accessorKey: 'order_no',
      header: '订单号',
      cell: ({ row }) => <div className="font-medium">{row.getValue('order_no')}</div>,
    },
    {
      id: 'user',
      header: '用户',
      cell: ({ row }) => {
        const order = row.original
        return (
          order.user ? (
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{order.user.nickname?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{order.user.nickname}</div>
                <div className="text-xs text-muted-foreground">{order.user.username}</div>
              </div>
            </div>
          ) : (
            <div>未知用户</div>
          )
        )
      },
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
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        let variant: 'default' | 'outline' | 'destructive' | 'secondary' = 'outline'
        let label = '未知'
        
        if (status === 'pending') {
          variant = 'secondary'
          label = '待支付'
        } else if (status === 'unpaid') {
          variant = 'secondary'
          label = '未支付'
        } else if (status === 'paid') {
          variant = 'default'
          label = '已支付'
        } else if (status === 'cancelled') {
          variant = 'destructive'
          label = '已取消'
        } else if (status === 'refunded') {
          variant = 'outline'
          label = '已退款'
        } else if (status === 'refunding') {
          variant = 'secondary'
          label = '退款中'
        }
        
        return <Badge variant={variant}>{label}</Badge>
      },
    },
    {
      accessorKey: 'created_at',
      header: '创建时间',
      cell: ({ row }) => <div>{formatDate(row.getValue('created_at'))}</div>,
    },
    {
      accessorKey: 'pay_time',
      header: '支付时间',
      cell: ({ row }) => {
        const payTime = row.getValue('pay_time') as string | null
        return <div>{payTime ? formatDate(payTime) : '-'}</div>
      },
    },
    {
      accessorKey: 'payment_type',
      header: '支付方式',
      cell: ({ row }) => {
        const paymentType = row.getValue('payment_type') as string
        if (!paymentType) return <div>-</div>
        
        let label = '未知'
        let variant: 'default' | 'outline' | 'secondary' | 'destructive' | 'success' | 'blue' | 'yellow' = 'outline'
        let isCardType = false
        
        if (paymentType === 'wechat') {
          label = '微信支付'
          variant = 'success' // 绿色
        } else if (paymentType === 'alipay') {
          label = '支付宝'
          variant = 'blue' // 蓝色
        } else if (paymentType === 'free') {
          label = '免费'
          variant = 'yellow'
        } else if (paymentType === 'card') {
          label = '兑换卷'
          isCardType = true
        } else {
          label = paymentType
          variant = 'yellow' // 黄色
        }
        
        if (isCardType) {
          return (
            <Badge className='border-transparent bg-gradient-to-r from-indigo-500 to-pink-500 [background-size:105%] bg-center text-white'>
              {label}
            </Badge>
          )
        }
        
        return <Badge variant={variant}>{label}</Badge>
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const order = row.original

        return (
          <div data-prevent-row-click="true">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 w-8 p-0'>
                  <span className='sr-only'>打开菜单</span>
                  <IconDotsVertical className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' onClick={(e) => e.stopPropagation()}>
                <DropdownMenuLabel>操作</DropdownMenuLabel>
                <CopyOrderNo order={order} />
                <DropdownMenuSeparator />
                {actionHandlers?.onView && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      actionHandlers.onView?.(order);
                    }}
                  >
                    查看详情
                  </DropdownMenuItem>
                )}
                {/* 只有已支付的订单才显示退款选项 */}
                {actionHandlers?.onRefund && order.status === 'paid' && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      actionHandlers.onRefund?.(order);
                    }}
                  >
                    申请退款
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {actionHandlers?.onDelete && (
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      actionHandlers.onDelete?.(order);
                    }}
                  >
                    删除订单
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

// 导出默认列定义
export const columns = createColumns() 