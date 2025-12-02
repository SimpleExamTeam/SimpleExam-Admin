import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useFeedback } from '../context/feedback-context'
import { Feedback } from '../data/schema'
import { 
  BlurDialog, 
  BlurDialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from '@/components/ui/blur-dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { feedbackApi } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { Switch } from '@/components/ui/switch'
import { IconMessage, IconUser } from '@tabler/icons-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

interface Props {
  open: boolean
  currentFeedback: Feedback
}

export function FeedbackReplyDialog({ open, currentFeedback }: Props) {
  const { setOpen, fetchFeedbacks } = useFeedback()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [markAsConfirmed, setMarkAsConfirmed] = useState(false)
  const { toast } = useToast()
  
  // 当对话框打开或当前反馈变化时，重置状态
  useEffect(() => {
    if (open && currentFeedback) {
      // 设置初始回复内容和状态
      setReplyContent(currentFeedback.reply_content || '')
      setMarkAsConfirmed(currentFeedback.status === 1)
    }
  }, [open, currentFeedback])

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setOpen(null)
      // 关闭对话框时清空回复内容
      setReplyContent('')
      setMarkAsConfirmed(false)
    }
  }

  const handleSubmit = async () => {
    if (replyContent.trim() === '') {
      toast({
        variant: "destructive",
        title: "回复内容不能为空",
        description: "请输入回复内容"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await feedbackApi.updateFeedback(currentFeedback.id, {
        reply_content: replyContent,
        status: markAsConfirmed ? 1 : 0
      }) as any

      if (response.code === 200) {
        toast({
          title: "回复成功",
          description: "反馈回复已保存"
        })
        fetchFeedbacks()
        // 成功提交后清空回复内容
        setReplyContent('')
        setMarkAsConfirmed(false)
        handleOpenChange(false)
      } else {
        toast({
          variant: "destructive",
          title: "回复失败",
          description: response.msg || "保存回复时出现错误"
        })
      }
    } catch (error) {
      console.error('回复反馈错误:', error)
      toast({
        variant: "destructive",
        title: "回复失败",
        description: "保存回复时出现错误"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <BlurDialog open={open} onOpenChange={handleOpenChange}>
      <BlurDialogContent className="max-w-3xl max-h-[90vh] p-4 sm:p-6">
        <DialogHeader className="text-left pb-2">
          <DialogTitle className="text-foreground/90 text-xl">
            {currentFeedback.reply_content ? "编辑回复" : "回复反馈"}
          </DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2 mt-1">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{currentFeedback.user.nickname?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{currentFeedback.user.nickname}</span>
              的反馈
              <Badge variant={currentFeedback.status === 0 ? 'outline' : 'default'} className="ml-auto">
                {currentFeedback.status === 0 ? '未确认' : '已确认'}
              </Badge>
            </div>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-4 -mr-4 scrollbar-thin">
          <div className="space-y-4 py-2">
            {/* 反馈内容区域 */}
            <div className="space-y-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
              <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                <IconMessage className="h-3.5 w-3.5" /> 反馈内容
              </h4>
              <div className="p-3 border rounded-md bg-background/40 backdrop-blur-sm border-background/20 whitespace-pre-wrap text-sm">
                {currentFeedback.feedback_content}
              </div>
              <div className="text-xs text-muted-foreground text-right">
                提交于 {format(parseISO(currentFeedback.created_at), 'yyyy年MM月dd日 HH:mm:ss', { locale: zhCN })}
              </div>
            </div>

            <Separator className="bg-foreground/10" />

            {/* 回复表单 */}
            <div className="space-y-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
              <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                <IconUser className="h-3.5 w-3.5" /> 回复内容
              </h4>

              <div className="space-y-2">
                <Textarea
                  id="reply-content"
                  placeholder="请输入您的回复内容..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={6}
                  className="resize-none bg-background/40 backdrop-blur-sm border-background/20"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="confirm-status"
                  checked={markAsConfirmed}
                  onCheckedChange={setMarkAsConfirmed}
                />
                <Label htmlFor="confirm-status" className="text-sm">标记为已确认</Label>
                <div className="ml-2 text-xs text-muted-foreground">
                  {markAsConfirmed ? "用户将看到此反馈已被处理" : "用户将看到此反馈仍在处理中"}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="mt-6 flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
            className="h-8 hover:bg-background/60 backdrop-blur-sm border-background/20 text-sm"
          >
            取消
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-8 hover:bg-primary/90 text-sm"
          >
            {isSubmitting ? "提交中..." : "提交回复"}
          </Button>
        </div>
      </BlurDialogContent>
    </BlurDialog>
  )
} 