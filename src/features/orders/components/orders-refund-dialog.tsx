import { useState } from 'react'
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
import { useToast } from '@/components/ui/use-toast'
import { ordersApi } from '@/lib/api'
import { Order } from '../data/schema'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { IconCoinYuan } from '@tabler/icons-react'

interface OrdersRefundDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
  onSuccess?: () => void
}

export function OrdersRefundDialog({
  open,
  onOpenChange,
  order,
  onSuccess
}: OrdersRefundDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [refundFee, setRefundFee] = useState<string>('')
  const [refundReason, setRefundReason] = useState<string>('')

  // 重置表单
  const resetForm = () => {
    setRefundFee('')
    setRefundReason('')
  }

  // 处理对话框打开状态变化
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  // 处理退款金额输入变化
  const handleRefundFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // 如果输入为空，直接设置
    if (inputValue === '') {
      setRefundFee('')
      return
    }

    const numericValue = parseFloat(inputValue)

    // 如果输入不是有效数字，不更新状态
    if (isNaN(numericValue)) {
      return
    }

    // 如果输入的金额超过可退款金额，自动重置为可退款金额
    if (numericValue > order!.amount) {
      setRefundFee(order!.amount.toString())
    } else {
      setRefundFee(inputValue)
    }
  }

  // 处理退款提交
  const handleSubmit = async () => {
    if (!order) return

    // 验证输入
    if (!refundFee.trim()) {
      toast({
        variant: "destructive",
        title: "退款金额不能为空",
        description: "请输入退款金额",
      })
      return
    }

    const refundAmount = parseFloat(refundFee)
    if (isNaN(refundAmount) || refundAmount <= 0) {
      toast({
        variant: "destructive",
        title: "退款金额无效",
        description: "请输入有效的退款金额",
      })
      return
    }

    if (refundAmount > order.amount) {
      toast({
        variant: "destructive",
        title: "退款金额过大",
        description: `退款金额不能超过订单金额 ¥${order.amount.toFixed(2)}`,
      })
      return
    }

    if (!refundReason.trim()) {
      toast({
        variant: "destructive",
        title: "退款原因不能为空",
        description: "请输入退款原因",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await ordersApi.refundOrder({
        order_no: order.order_no,
        refund_fee: refundAmount,
        refund_reason: refundReason
      })

      if (response.code === 200) {
        toast({
          variant: "success",
          title: "退款申请成功",
          description: "订单退款申请已提交",
        })
        handleOpenChange(false)
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast({
          variant: "destructive",
          title: "退款申请失败",
          description: response.msg || "提交退款申请时出现错误",
        })
      }
    } catch (error) {
      console.error('退款申请错误:', error)
      toast({
        variant: "destructive",
        title: "退款申请失败",
        description: "提交退款申请时出现错误",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 如果没有订单数据，不显示内容
  if (!order) {
    return (
      <BlurDialog
        open={open}
        onOpenChange={handleOpenChange}
      >
        <BlurDialogContent className='sm:max-w-md max-h-[90vh]'>
          <DialogHeader className='text-left'>
            <DialogTitle className="text-foreground/90 text-xl">申请退款</DialogTitle>
            <DialogDescription className="text-muted-foreground/90">
              未找到订单信息
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
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
    <BlurDialog open={open} onOpenChange={handleOpenChange}>
      <BlurDialogContent className='sm:max-w-md max-h-[90vh]'>
        <DialogHeader className='text-left'>
          <DialogTitle className="text-foreground/90 text-xl">申请退款</DialogTitle>
          <DialogDescription className="text-muted-foreground/90">
            为订单 <span className="font-medium">{order.order_no}</span> 申请退款
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="order-info" className="text-xs font-medium text-muted-foreground/90">订单信息</Label>
            <div className="rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm p-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">课程:</span>
                  <span className="font-medium ml-1">{order.course_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">金额:</span>
                  <span className="font-medium ml-1">¥{order.amount.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">用户:</span>
                  <span className="font-medium ml-1">{order.user?.nickname || '未知'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">支付方式:</span>
                  <span className="font-medium ml-1">{order.payment_type || '-'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="refund-fee" className="text-xs font-medium text-muted-foreground/90">退款金额</Label>
            <div className="relative">
              <IconCoinYuan className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="refund-fee"
                type="text"
                step="0.01"
                min="0.01"
                max={order.amount}
                placeholder={`最大可退 ¥${order.amount.toFixed(2)}`}
                value={refundFee}
                onChange={handleRefundFeeChange}
                className="pl-9 bg-background/60 backdrop-blur-sm border-background/20"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="refund-reason" className="text-xs font-medium text-muted-foreground/90">退款原因</Label>
            <Textarea
              id="refund-reason"
              placeholder="请输入退款原因"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              rows={3}
              className="bg-background/60 backdrop-blur-sm border-background/20"
            />
          </div>
        </div>
        
        <DialogFooter className="mt-4">
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
            className="hover:bg-background/60 backdrop-blur-sm border-background/20"
          >
            取消
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="hover:bg-primary/90"
          >
            {isLoading ? "提交中..." : "提交退款"}
          </Button>
        </DialogFooter>
      </BlurDialogContent>
    </BlurDialog>
  )
} 