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
  DialogFooter,
  DialogDescription
} from '@/components/ui/blur-dialog'
import { IconEdit, IconTrash, IconMessage, IconCalendar, IconUser, IconSearch } from '@tabler/icons-react'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNavigate } from '@tanstack/react-router'
import { useToast } from '@/components/ui/use-toast'

interface Props {
  open: boolean
  currentFeedback: Feedback
}

// 函数用于从错题反馈中提取题目ID
const extractQuestionId = (content: string): number | null => {
  // 匹配错题反馈格式：[ID: 数字]
  const match = content.match(/错题反馈.*?\[ID:\s*(\d+)\]/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return null;
};

export function FeedbackViewDialog({ open, currentFeedback }: Props) {
  const { setOpen } = useFeedback()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setOpen(null)
    }
  }

  const handleReply = () => {
    setOpen('reply')
  }

  const handleDelete = () => {
    setOpen('delete')
  }
  
  // 处理查看错题
  const handleViewQuestion = () => {
    const questionId = extractQuestionId(currentFeedback.feedback_content);
    if (questionId) {
      // 关闭当前对话框
      setOpen(null);
      
      // 提示用户
      toast({
        title: "正在跳转到题目",
        description: `正在查找题目ID: ${questionId}`,
      });
      
      // 导航到题库管理页面并搜索对应题目
      navigate({ to: '/questions', replace: true });
      
      // 使用setTimeout确保先完成导航，再进行搜索
      setTimeout(() => {
        // 触发题目搜索事件
        const searchEvent = new CustomEvent('search-question-by-id', { 
          detail: { questionId } 
        });
        document.dispatchEvent(searchEvent);
      }, 300);
    }
  }
  
  // 判断是否包含错题反馈
  const questionId = extractQuestionId(currentFeedback.feedback_content);
  const hasQuestionFeedback = !!questionId;

  return (
    <BlurDialog open={open} onOpenChange={handleOpenChange}>
      <BlurDialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader className="text-left">
          <DialogTitle className="text-foreground/90 text-xl">反馈详情</DialogTitle>
          <DialogDescription className="text-muted-foreground/90">
            查看用户 <span className="font-medium">{currentFeedback.user.nickname}</span> 的反馈信息
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-4 -mr-4 scrollbar-thin">
          <div className="space-y-4 py-2">
            {/* 用户信息区域 */}
            <div className="flex items-center gap-4 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
              <Avatar className="h-16 w-16 ring-2 ring-background/40 ring-offset-2 ring-offset-background/80">
                <AvatarFallback>{currentFeedback.user.nickname?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{currentFeedback.user.nickname}</h3>
                    <p className="text-sm text-muted-foreground">{currentFeedback.user.username}</p>
                  </div>
                  <Badge variant={currentFeedback.status === 0 ? 'outline' : 'default'}>
                    {currentFeedback.status === 0 ? '未确认' : '已确认'}
                  </Badge>
                </div>
                <div className="mt-2 text-sm flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <IconCalendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{format(parseISO(currentFeedback.created_at), 'yyyy年MM月dd日 HH:mm:ss', { locale: zhCN })}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-foreground/10" />

            <div className="grid grid-cols-1 gap-4">
              {/* 反馈内容区域 */}
              <div className="space-y-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                  <IconMessage className="h-3.5 w-3.5" /> 反馈内容
                </h4>
                <div className="p-3 border rounded-md bg-background/40 backdrop-blur-sm border-background/20 whitespace-pre-wrap">
                  {currentFeedback.feedback_content}
                </div>
                {hasQuestionFeedback && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 flex items-center gap-1 text-primary" 
                    onClick={handleViewQuestion}
                  >
                    <IconSearch className="h-3.5 w-3.5" />
                    查看题目 #{questionId}
                  </Button>
                )}
              </div>

              {/* 回复内容区域 */}
              <div className="space-y-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                  <IconUser className="h-3.5 w-3.5" /> 回复内容
                </h4>
                {currentFeedback.reply_content ? (
                  <div className="p-3 border rounded-md bg-background/40 backdrop-blur-sm border-background/20 whitespace-pre-wrap">
                    {currentFeedback.reply_content}
                  </div>
                ) : (
                  <div className="p-3 border rounded-md border-dashed text-muted-foreground">
                    暂无回复内容
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <div className="flex w-full justify-between items-center gap-2">
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="h-8 hover:bg-destructive/90 text-sm"
            >
              <IconTrash className="h-3.5 w-3.5 mr-1" />
              删除反馈
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleOpenChange(false)}
                className="h-8 hover:bg-background/60 backdrop-blur-sm border-background/20 text-sm"
              >
                关闭
              </Button>
              <Button 
                variant="default" 
                onClick={handleReply}
                className="h-8 hover:bg-primary/90 text-sm gap-1"
              >
                <IconEdit className="h-3.5 w-3.5" />
                {currentFeedback.status === 0 ? "回复" : "编辑回复"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </BlurDialogContent>
    </BlurDialog>
  )
} 