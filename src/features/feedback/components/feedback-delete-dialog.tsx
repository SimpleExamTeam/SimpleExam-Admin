import { useState } from 'react'
import { IconAlertTriangle } from '@tabler/icons-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useFeedback } from '../context/feedback-context'
import { Feedback } from '../data/schema'
import { feedbackApi } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { BlurDialog, BlurDialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/blur-dialog'
import { Button } from '@/components/ui/button'
import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Props {
  open: boolean
  currentFeedback: Feedback
}

export function FeedbackDeleteDialog({ open, currentFeedback }: Props) {
  const { setOpen, fetchFeedbacks } = useFeedback()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setOpen(null)
    }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      const response = await feedbackApi.deleteFeedback(currentFeedback.id) as any
      
      if (response.code === 200) {
        toast({
          title: "删除成功",
          description: "反馈已被成功删除",
        })
        fetchFeedbacks()
      } else {
        toast({
          variant: "destructive",
          title: "删除失败",
          description: response.msg || "删除反馈时出现错误",
        })
      }
    } catch (error) {
      console.error('删除反馈错误:', error)
      toast({
        variant: "destructive",
        title: "删除失败",
        description: "删除反馈时出现错误",
      })
    } finally {
      setIsSubmitting(false)
      handleOpenChange(false)
    }
  }

  return (
    <BlurDialog open={open} onOpenChange={handleOpenChange}>
      <BlurDialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <IconAlertTriangle className="h-5 w-5" />
            确认删除反馈
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4 -mr-4 scrollbar-thin">
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
              <Avatar className="h-12 w-12 ring-1 ring-background/40 ring-offset-1 ring-offset-background/80">
                <AvatarFallback>{currentFeedback.user.nickname?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{currentFeedback.user.nickname}</h3>
                    <p className="text-sm text-muted-foreground">{currentFeedback.user.username}</p>
                  </div>
                  <Badge variant={currentFeedback.status === 0 ? 'outline' : 'default'} className="ml-auto">
                    {currentFeedback.status === 0 ? '未确认' : '已确认'}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  提交于 {format(parseISO(currentFeedback.created_at), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                </div>
              </div>
            </div>
            
            <div className="p-3 border rounded-lg bg-background/40 backdrop-blur-sm border-background/20">
              <div className="text-sm font-medium mb-2">反馈内容：</div>
              <div className="p-2 border rounded bg-background/40 backdrop-blur-sm border-background/20 text-sm whitespace-pre-wrap">
                {currentFeedback.feedback_content.length > 150
                  ? `${currentFeedback.feedback_content.substring(0, 150)}...`
                  : currentFeedback.feedback_content}
              </div>
            </div>

            <Alert variant="destructive" className="border-2">
              <AlertTitle className="flex items-center gap-1">
                <IconAlertTriangle className="h-4 w-4" />
                删除警告
              </AlertTitle>
              <AlertDescription>
                此操作将<span className="font-bold">永久删除</span>该反馈记录。删除后，数据将无法恢复。
              </AlertDescription>
            </Alert>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 mt-2">
          <div className="flex w-full justify-end items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="h-8 hover:bg-background/60 backdrop-blur-sm border-background/20 text-sm"
            >
              取消
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isSubmitting}
              className="h-8 hover:bg-destructive/90 text-sm"
            >
              {isSubmitting ? "删除中..." : "确认删除"}
            </Button>
          </div>
        </DialogFooter>
      </BlurDialogContent>
    </BlurDialog>
  )
} 