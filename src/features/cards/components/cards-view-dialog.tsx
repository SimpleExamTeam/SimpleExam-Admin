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
import { Card } from '../data/schema'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { IconCreditCard, IconCalendar, IconId, IconCoin, IconCopy, IconCheck, IconHistory } from '@tabler/icons-react'
import { useToast } from '@/components/ui/use-toast'
import { CardsRecordsDialog } from './cards-records-dialog'

interface CardsViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Card
  onEdit?: (card: Card) => void
  onDelete?: (card: Card) => void
}

export function CardsViewDialog({
  open,
  onOpenChange,
  currentRow,
  onEdit,
  onDelete,
}: CardsViewDialogProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState<string | null>(null)
  const [isRecordsDialogOpen, setIsRecordsDialogOpen] = useState(false)

  // 复制到剪贴板
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(field)
        toast({
          title: '复制成功',
          description: '内容已复制到剪贴板',
        })
        setTimeout(() => setCopied(null), 2000)
      })
      .catch(() => {
        toast({
          variant: 'destructive',
          title: '复制失败',
          description: '无法复制到剪贴板',
        })
      })
  }

  // 打开兑换记录对话框
  const handleViewRecords = () => {
    setIsRecordsDialogOpen(true)
  }

  return (
    <>
      <BlurDialog open={open} onOpenChange={onOpenChange}>
        <BlurDialogContent className="sm:max-w-2xl max-h-[90vh]">
          <DialogHeader className="text-left">
            <DialogTitle className="text-foreground/90 text-xl">卡券详情</DialogTitle>
            <DialogDescription className="text-muted-foreground/90">
              查看卡券 <span className="font-medium">{currentRow.card_no}</span> 的详细信息
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[65vh] pr-4 -mr-4 scrollbar-thin">
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{currentRow.card_no}</h3>
                    <div className="mt-2 text-sm flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <IconId className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>ID: {currentRow.id}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0"
                        onClick={() => handleCopy(currentRow.card_no, 'card_no')}
                      >
                        {copied === 'card_no' ? (
                          <IconCheck className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <IconCopy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                <Badge variant={currentRow.is_expired ? 'destructive' : 'default'}>
                  {currentRow.is_expired ? '已过期' : '有效'}
                </Badge>
              </div>

              <Separator className="bg-foreground/10" />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                  <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                    <IconCreditCard className="h-3.5 w-3.5" /> 卡券信息
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground/90">课程名称</p>
                      <p className="text-sm font-medium truncate" title={currentRow.course_name}>
                        {currentRow.course_name || '无关联课程'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground/90">课程ID</p>
                      <p className="text-sm font-medium truncate">
                        {currentRow.course_id || '无'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                  <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                    <IconCoin className="h-3.5 w-3.5" /> 使用信息
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground/90">金额</p>
                      <p className="text-sm font-medium">
                        <span className="font-semibold text-base">¥{currentRow.amount.toFixed(2)}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground/90">使用情况</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          {currentRow.used}/{currentRow.total}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 py-0 text-xs gap-1"
                          onClick={handleViewRecords}
                        >
                          <IconHistory size={14} />
                          查看记录
                        </Button>
                      </div>
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
                      <p className="text-xs font-medium text-muted-foreground/90">过期时间</p>
                      <p className="text-sm font-medium">{formatDate(currentRow.expire_time)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                  <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                    <IconCalendar className="h-3.5 w-3.5" /> 有效期信息
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground/90">有效期(天)</p>
                      <p className="text-sm font-medium">{currentRow.expire_days}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground/90">状态</p>
                      <p className="text-sm font-medium">
                        <Badge variant={currentRow.is_expired ? 'destructive' : 'default'} className="mt-1">
                          {currentRow.is_expired ? '已过期' : '有效'}
                        </Badge>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          
          <DialogFooter className="mt-4">
            {onDelete && (
              <Button 
                variant="destructive"
                onClick={() => onDelete(currentRow)}
                className="mr-auto"
              >
                删除卡券
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="hover:bg-background/60 backdrop-blur-sm border-background/20"
            >
              关闭
            </Button>
            {onEdit && (
              <Button 
                onClick={() => onEdit(currentRow)}
              >
                编辑卡券
              </Button>
            )}
          </DialogFooter>
        </BlurDialogContent>
      </BlurDialog>

      {/* 卡券兑换记录对话框 */}
      <CardsRecordsDialog
        open={isRecordsDialogOpen}
        onOpenChange={setIsRecordsDialogOpen}
        currentCard={currentRow}
      />
    </>
  )
} 