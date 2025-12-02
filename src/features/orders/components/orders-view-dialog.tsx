'use client'

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { 
  BlurDialog,
  BlurDialogContent,
} from '@/components/ui/blur-dialog'
import { Button } from '@/components/ui/button'
import { Order } from '../data/schema'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { IconCalendar, IconId, IconShoppingCart, IconCreditCard, IconCoin } from '@tabler/icons-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Order | null
}

export function OrdersViewDialog({ currentRow, open, onOpenChange }: Props) {
  // 格式化订单状态
  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'pending': return '待支付';
      case 'unpaid': return '未支付';
      case 'paid': return '已支付';
      case 'cancelled': return '已取消';
      case 'refunded': return '已退款';
      case 'refunding': return '退款中';
      default: return '未知状态';
    }
  }

  // 格式化支付方式
  const getPaymentTypeLabel = (type: string) => {
    switch(type) {
      case 'wechat': return '微信支付';
      case 'alipay': return '支付宝';
      case 'card': return '兑换卷';
      case 'free': return '免费';
      default: return type || '无';
    }
  }

  // 获取状态徽章样式
  const getStatusBadgeVariant = (status: string): 'default' | 'outline' | 'destructive' | 'secondary' => {
    switch(status) {
      case 'paid': return 'default';
      case 'cancelled': return 'destructive';
      case 'refunded': return 'outline';
      case 'refunding': return 'secondary';
      case 'pending': return 'secondary';
      case 'unpaid': return 'secondary';
      default: return 'outline';
    }
  }
  
  // 如果没有订单数据，不显示内容
  if (!currentRow) {
    return (
      <BlurDialog
        open={open}
        onOpenChange={onOpenChange}
      >
        <BlurDialogContent className='sm:max-w-2xl max-h-[90vh]'>
          <DialogHeader className='text-left'>
            <DialogTitle className="text-foreground/90 text-xl">订单详情</DialogTitle>
            <DialogDescription className="text-muted-foreground/90">
              未找到订单信息
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="hover:bg-background/60 backdrop-blur-sm border-background/20"
            >
              关闭
            </Button>
          </DialogFooter>
        </BlurDialogContent>
      </BlurDialog>
    )
  }
  
  return (
    <BlurDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <BlurDialogContent className='sm:max-w-2xl max-h-[90vh]'>
        <DialogHeader className='text-left'>
          <DialogTitle className="text-foreground/90 text-xl">订单详情</DialogTitle>
          <DialogDescription className="text-muted-foreground/90">
            查看订单 <span className="font-medium">{currentRow.order_no}</span> 的详细信息
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[65vh] pr-4 -mr-4 scrollbar-thin">
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{currentRow.order_no}</h3>
                  <div className="mt-2 text-sm flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <IconId className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>ID: {currentRow.id}</span>
                    </div>
                  </div>
                </div>
              </div>
              <Badge variant={getStatusBadgeVariant(currentRow.status)}>
                {getStatusLabel(currentRow.status)}
              </Badge>
            </div>

            <Separator className="bg-foreground/10" />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                  <IconShoppingCart className="h-3.5 w-3.5" /> 课程信息
                </h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground/90">课程名称</p>
                    <p className="text-sm font-medium truncate" title={currentRow.course_name}>
                      {currentRow.course_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground/90">课程ID</p>
                    <p className="text-sm font-medium truncate">
                      {currentRow.course_id}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                  <IconCreditCard className="h-3.5 w-3.5" /> 支付信息
                </h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground/90">金额</p>
                    <p className="text-sm font-medium">
                      <span className="font-semibold text-base">¥{currentRow.amount.toFixed(2)}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground/90">支付方式</p>
                    <p className="text-sm font-medium">
                      {getPaymentTypeLabel(currentRow.payment_type)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                  <IconCalendar className="h-3.5 w-3.5" /> 时间信息
                </h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground/90">创建时间</p>
                    <p className="text-sm font-medium">{formatDate(currentRow.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground/90">支付时间</p>
                    <p className="text-sm font-medium">{currentRow.pay_time ? formatDate(currentRow.pay_time) : '未支付'}</p>
                  </div>
                  {currentRow.expire_time && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground/90">过期时间</p>
                      <p className="text-sm font-medium">{formatDate(currentRow.expire_time)}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                  <IconCoin className="h-3.5 w-3.5" /> 用户信息
                </h4>
                <div className="space-y-2">
                <div>
                    <p className="text-xs font-medium text-muted-foreground/90">用户ID</p>
                    <p className="text-sm font-medium">{currentRow.user.id}</p>
                  </div>
                <div>
                    <p className="text-xs font-medium text-muted-foreground/90">昵称</p>
                    <p className="text-sm font-medium">{currentRow.user.nickname}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground/90">用户名</p>
                    <p className="text-sm font-medium">{currentRow.user.username}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="hover:bg-background/60 backdrop-blur-sm border-background/20"
          >
            关闭
          </Button>
        </DialogFooter>
      </BlurDialogContent>
    </BlurDialog>
  )
} 