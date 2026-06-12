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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Question, QuestionType } from '../data/schema'
import { formatDate, cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { IconCalendar, IconId, IconList, IconSchool, IconFileDescription, IconTrash, IconAlertCircle, IconPencil, IconWand } from '@tabler/icons-react'
import { questionsApi, practiceApi } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// 题目类型映射
const questionTypeMap = {
  [QuestionType.SINGLE]: { label: '单选题', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', variant: 'info' },
  [QuestionType.MULTIPLE]: { label: '多选题', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', variant: 'secondary' },
  [QuestionType.JUDGE]: { label: '判断题', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', variant: 'success' },
}

interface QuestionsViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Question
  onSuccess?: () => void
  onEdit?: (question: Question) => void
  courses: Array<{ id: number; name: string; displayName?: string; category_level1?: string; category_level2?: string }>
}

export function QuestionsViewDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
  onEdit,
  courses
}: QuestionsViewDialogProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false)
  const { toast } = useToast()
  const type = currentRow.type as QuestionType
  const typeInfo = questionTypeMap[type] || { label: type, color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', variant: 'default' }
  const typeDesc = currentRow.type_desc || typeInfo.label

  // 处理选项文本，去掉选项标签前缀（如A、B、C等）
  const cleanOptionText = (text: string, label: string): string => {
    // 尝试匹配并去除以下几种格式：
    // 1. "A. 文本" 或 "A．文本"
    // 2. "A、文本"
    // 3. "A:文本" 或 "A：文本"
    // 4. "A 文本"
    // 5. "A）文本" 或 "A)文本"
    const regex = new RegExp(`^${label}[\\.．、:\\s：\\)）]\\s*`, 'i');
    return text.replace(regex, '');
  };

  // 处理删除题目
  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await questionsApi.deleteQuestion(currentRow.id);
      
      if (response.code === 200) {
        toast({
          title: "删除成功",
          description: "题目已删除",
        });
        setIsDeleteDialogOpen(false);
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast({
          variant: "destructive",
          title: "删除失败",
          description: response.msg || "操作失败，请重试",
        });
      }
    } catch (error) {
      console.error('删除题目失败:', error);
      toast({
        variant: "destructive",
        title: "删除失败",
        description: "操作失败，请重试",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // 处理生成解析说明
  const handleGenerateExplanation = async () => {
    setIsGeneratingExplanation(true);
    
    try {
      // 如果已有解析，传递 force: true 以覆盖
      const response = currentRow.explanation 
        ? await practiceApi.generateExplanationWithForce(currentRow.id)
        : await practiceApi.generateExplanation(currentRow.id);
      
      if (response.code === 200 && response.data?.explanation) {
        toast({
          title: currentRow.explanation ? "解析重新生成成功" : "解析生成成功",
          description: currentRow.explanation ? "题目解析已成功重新生成" : "题目解析已成功生成",
        });
        // 更新当前行的解析说明
        currentRow.explanation = response.data.explanation;
        if (onSuccess) onSuccess();
      } else {
        toast({
          variant: "destructive",
          title: "生成失败",
          description: response.msg || "生成解析说明失败，请重试",
        });
      }
    } catch (error) {
      console.error('生成解析说明失败:', error);
      toast({
        variant: "destructive",
        title: "生成失败",
        description: "生成解析说明失败，请重试",
      });
    } finally {
      setIsGeneratingExplanation(false);
    }
  };

  return (
    <>
      <BlurDialog open={open} onOpenChange={onOpenChange}>
        <BlurDialogContent className="sm:max-w-2xl max-h-[90vh]">
          <DialogHeader className='text-left'>
            <DialogTitle className="text-foreground/90 text-xl flex items-center">
              题目详情
              <Badge variant="outline" className={`${typeInfo.color} border-none ml-2`}>
                {typeDesc}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground/90">
              查看题目 <span className="font-medium">#{currentRow.id}</span> 的详细信息
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[65vh] pr-4 -mr-4 scrollbar-thin">
            <div className="space-y-4 pt-2">
              <div className="p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg/6 font-semibold pr-4 flex-1">{currentRow.question}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-sm flex items-center gap-1 whitespace-nowrap">
                      <IconId className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>ID: {currentRow.id}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-foreground/10" />
              
              <div className="space-y-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                  <IconList className="h-3.5 w-3.5" /> 选项与答案
                </h4>
                <div className="space-y-2">
                  {currentRow.options.map((option) => {
                    const isCorrect = currentRow.answer.includes(option.label)
                    return (
                      <div 
                        key={option.label} 
                        className={`flex items-start p-2 rounded-md ${
                          isCorrect ? 'bg-green-50/30 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50' : 'border border-background/20'
                        }`}
                      >
                        <div className="min-w-[24px] h-6 flex items-center justify-center rounded-full bg-background/70 backdrop-blur-sm border border-background/20 text-xs font-medium mr-2">
                          {option.label}
                        </div>
                        <div className={`text-sm font-medium flex-1 ${
                          isCorrect ? 'text-green-600 dark:text-green-400' : ''
                        }`}>
                          {cleanOptionText(option.text, option.label)}
                        </div>
                        {isCorrect && (
                          <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400 border-none">
                            正确答案
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                      <IconFileDescription className="h-3.5 w-3.5" /> 解析说明
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateExplanation}
                      disabled={isGeneratingExplanation}
                      className="h-6 text-xs"
                    >
                      <IconWand className="h-3.5 w-3.5 mr-1" />
                      {isGeneratingExplanation ? '生成中...' : (currentRow.explanation ? '重新生成解析' : '生成解析')}
                    </Button>
                  </div>
                  {currentRow.explanation ? (
                    <p className="text-sm">{currentRow.explanation}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">暂无解析说明</p>
                  )}
                </div>
                
                  <div className="space-y-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                    <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                      <IconSchool className="h-3.5 w-3.5" /> 所属课程
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground/90">课程名称</p>
                        <p className="text-sm font-medium">{(() => {
                          const course = courses.find(c => c.id === currentRow.course_id);
                          return course?.category_level2 ? `${course.category_level2}-${currentRow.course_name}` : currentRow.course_name;
                        })()}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground/90">课程ID</p>
                        <p className="text-sm font-medium">{currentRow.course_id}</p>
                      </div>
                    </div>
                  </div>
              </div>
              
              <div className="space-y-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                  <IconCalendar className="h-3.5 w-3.5" /> 时间信息
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground/90">创建时间</p>
                    <p className="text-sm font-medium">{formatDate(currentRow.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground/90">ID</p>
                    <p className="text-sm font-medium">#{currentRow.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          
          <DialogFooter className="mt-4">
            <div className="flex w-full justify-between items-center gap-2">
              <Button 
                variant="destructive" 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="h-8 hover:bg-destructive/90 text-sm"
              >
                <IconTrash className="h-3.5 w-3.5 mr-1" />
                删除题目
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="h-8 hover:bg-background/60 backdrop-blur-sm border-background/20 text-sm"
                >
                  关闭
                </Button>
                {onEdit && (
                  <Button
                    onClick={() => {
                      // 先调用编辑函数，再关闭当前对话框
                      onEdit(currentRow);
                      // 延迟关闭当前对话框，确保编辑对话框已经打开
                      setTimeout(() => {
                        onOpenChange(false);
                      }, 100);
                    }}
                    className="h-8 hover:bg-primary/90 text-sm"
                  >
                    <IconPencil className="h-3.5 w-3.5 mr-1" />
                    编辑
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </BlurDialogContent>
      </BlurDialog>
      
      {/* 删除确认对话框 */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <IconAlertCircle className="h-5 w-5 text-destructive mr-2" />
              确认删除题目
            </AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除这个题目吗？此操作不可撤销，删除后数据将无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="h-8 hover:bg-background/60 backdrop-blur-sm border-background/20 text-sm"
              disabled={isDeleting}
            >
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className={cn(
                "h-8 bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm text-white",
                isDeleting && "opacity-80 pointer-events-none"
              )}
              disabled={isDeleting}
            >
              {isDeleting ? "删除中..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 