import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { 
  BlurDialog, 
  BlurDialogContent 
} from '@/components/ui/blur-dialog'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { IconTrash, IconPlus, IconBook, IconAbc, IconSchool, IconFileDescription, IconListCheck, IconAlertCircle, IconId } from '@tabler/icons-react'
import { useToast } from '@/components/ui/use-toast'
import { questionsApi, coursesApi } from '@/lib/api'
import { Question, QuestionType, questionFormSchema, QuestionFormData } from '../data/schema'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
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

// 定义课程数据接口，匹配API返回的实际数据结构
interface Course {
  id: number
  name: string
  category_level1?: string
  category_level2?: string
}

interface QuestionsEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Question | null
  onSuccess?: () => void
}

export function QuestionsEditDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: QuestionsEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const isEditMode = !!currentRow
  const { toast } = useToast()

  // 定义表单
  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      type: 'single',
      question: '',
      options: [
        { label: 'A', text: '' },
        { label: 'B', text: '' },
      ],
      answer: '',
      explanation: '',
      course_id: 0,
    },
  })

  // 加载课程数据
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // 使用大pageSize参数加载所有课程数据
        const response = await coursesApi.getCourses({
          page: 1,
          size: 1000, // 加载更多课程
        })
        if (response.code === 200 && response.data?.items) {
          setCourses(response.data.items)
        }
      } catch (error) {
        console.error('获取课程数据失败:', error)
        toast({
          variant: "destructive",
          title: "获取课程失败",
          description: "加载课程数据时出现错误",
        })
      }
    }
    
    fetchCourses()
  }, [])

  // 如果是编辑模式，加载题目数据
  useEffect(() => {
    if (currentRow && open) {
      // 将答案转换为表单需要的格式
      const formattedAnswer = currentRow.answer
      
      // 编辑模式下，处理可能包含重复序号的选项文本
      const processedOptions = currentRow.options.map(option => {
        // 清理文本开头可能存在的标签序号，避免显示重复序号
        const cleanText = option.text.replace(/^[A-Z0-9][\.\、\:）\)]?\s*/i, '');
        
        return {
          ...option,
          text: cleanText
        };
      });
      
      form.reset({
        type: currentRow.type as QuestionType,
        question: currentRow.question,
        options: processedOptions,
        answer: formattedAnswer,
        explanation: currentRow.explanation || '',
        course_id: currentRow.course_id,
      })
    } else if (open) {
      // 新建模式，使用默认选项模板
      const defaultOptions = getDefaultOptions('single');
      
      // 新建模式，重置表单
      form.reset({
        type: 'single',
        question: '',
        options: defaultOptions,
        answer: '',
        explanation: '',
        course_id: 0,
      })
    }
  }, [currentRow, open, form])

  // 根据题目类型获取选项模板
  const getDefaultOptions = (type: string) => {
    // 生成选项函数
    const generateOptions = (count: number, defaultTexts?: string[]) => {
      return Array.from({ length: count }, (_, i) => {
        const label = String.fromCharCode(65 + i); // A, B, C...
        // 只有判断题或明确提供了默认文本时才使用默认文本
        const text = defaultTexts && i < defaultTexts.length ? 
                     defaultTexts[i] : 
                     "";  // 对于其他题型，使用空文本，让用户输入
        return { label, text };
      });
    };
    
    switch (type) {
      case QuestionType.SINGLE:
      case QuestionType.MULTIPLE:
        return generateOptions(4); // A, B, C, D 无默认文本
      case QuestionType.JUDGE:
        return generateOptions(2, ['正确', '错误']); // 判断题保留默认文本
      default:
        return generateOptions(2); // A, B 无默认文本
    }
  }

  // 处理题目类型变更
  const handleTypeChange = (type: string) => {
    const defaultOptions = getDefaultOptions(type)
    form.setValue('options', defaultOptions)
    form.setValue('answer', '')
  }

  // 添加选项
  const handleAddOption = () => {
    const currentOptions = form.getValues('options')
    if (currentOptions.length >= 10) {
      toast({
        variant: "destructive",
        title: "无法添加更多选项",
        description: "选项数量已达上限",
      })
      return
    }
    
    // 生成新的选项标签 (A, B, C...)
    const newLabel = String.fromCharCode(65 + currentOptions.length)
    // 添加新选项，不预设默认文本，让用户输入
    form.setValue('options', [...currentOptions, { label: newLabel, text: "" }])
  }

  // 删除选项
  const handleRemoveOption = (index: number) => {
    const currentOptions = form.getValues('options')
    if (currentOptions.length <= 2) {
      toast({
        variant: "destructive",
        title: "无法删除选项",
        description: "至少需要两个选项",
      })
      return
    }

    // 更新选项，并重新分配标签 (A, B, C...)
    const newOptions = currentOptions.filter((_, i) => i !== index)
      .map((option, i) => ({
        ...option,
        label: String.fromCharCode(65 + i)
      }))
    form.setValue('options', newOptions)
    
    // 如果删除的选项是已选中的答案，则清空答案
    const answer = form.getValues('answer')
    const optionLabel = currentOptions[index].label
    if (answer.includes(optionLabel)) {
      const newAnswer = answer.split('').filter(a => a !== optionLabel).join('')
      form.setValue('answer', newAnswer)
    }
  }

  // 处理提交
  const onSubmit = async (data: QuestionFormData) => {
    setIsLoading(true)
    
    try {
      // 处理所有题型选项，确保文本不为空
      const processedData = { ...data };
      processedData.options = processedData.options.map(option => {
        // 只有当文本为空时才使用默认值
        if (!option.text || !option.text.trim()) {
          return {
            ...option,
            text: `选项${option.label}`
          };
        }
        
        return option; // 保持用户输入的内容不变
      });
      
      // 对答案进行排序，确保按ABCDEFG顺序
      if (processedData.answer) {
        const answerArray = processedData.answer.split('');
        answerArray.sort(); // 字母排序
        processedData.answer = answerArray.join('');
      }
      
      let response
      
      if (isEditMode && currentRow) {
        response = await questionsApi.updateQuestion(currentRow.id, processedData)
      } else {
        response = await questionsApi.createQuestion(processedData)
      }
      
      if (response.code === 200) {
        toast({
          title: isEditMode ? "更新成功" : "创建成功",
          description: isEditMode ? "题目已更新" : "新题目已创建",
        })
        onOpenChange(false)
        if (onSuccess) onSuccess()
      } else {
        toast({
          variant: "destructive",
          title: isEditMode ? "更新失败" : "创建失败",
          description: response.msg || "操作失败，请重试",
        })
      }
    } catch (error) {
      console.error(isEditMode ? '更新题目失败:' : '创建题目失败:', error)
      toast({
        variant: "destructive",
        title: isEditMode ? "更新失败" : "创建失败",
        description: "操作失败，请重试",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // 渲染答案选择控件
  const renderAnswerControl = () => {
    const type = form.watch('type')
    const options = form.watch('options')
    
    if (type === QuestionType.SINGLE) {
      return (
        <RadioGroup 
          onValueChange={(value) => form.setValue('answer', value)}
          value={form.watch('answer')}
          className="space-y-1"
        >
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2 p-1.5 rounded-md border border-background/20 bg-background/60 backdrop-blur-sm">
              <RadioGroupItem value={option.label} id={`answer-${option.label}`} />
              <div className="min-w-[20px] h-5 flex items-center justify-center rounded-full bg-background/70 backdrop-blur-sm border border-background/20 text-xs font-medium">
                {option.label}
              </div>
              <label htmlFor={`answer-${option.label}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 truncate">
                {option.text ? option.text : `选项${option.label}`}
              </label>
            </div>
          ))}
        </RadioGroup>
      )
    } else if (type === QuestionType.MULTIPLE) {
      return (
        <div className="space-y-1">
          {options.map((option, index) => {
            const isChecked = form.watch('answer').includes(option.label)
            return (
              <div key={index} className="flex items-center space-x-2 p-1.5 rounded-md border border-background/20 bg-background/60 backdrop-blur-sm">
                <Checkbox 
                  id={`answer-${option.label}`} 
                  checked={isChecked}
                  onCheckedChange={(checked) => {
                    const currentAnswer = form.watch('answer')
                    if (checked) {
                      // 添加到答案中
                      const newAnswer = currentAnswer + option.label
                      form.setValue('answer', newAnswer)
                    } else {
                      // 从答案中移除
                      const newAnswer = currentAnswer.replace(option.label, '')
                      form.setValue('answer', newAnswer)
                    }
                  }}
                />
                <div className="min-w-[20px] h-5 flex items-center justify-center rounded-full bg-background/70 backdrop-blur-sm border border-background/20 text-xs font-medium">
                  {option.label}
                </div>
                <label htmlFor={`answer-${option.label}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 truncate">
                  {option.text ? option.text : `选项${option.label}`}
                </label>
              </div>
            )
          })}
        </div>
      )
    } else {
      // 判断题
      return (
        <RadioGroup 
          onValueChange={(value) => form.setValue('answer', value)}
          value={form.watch('answer')}
          className="space-y-1"
        >
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2 p-1.5 rounded-md border border-background/20 bg-background/60 backdrop-blur-sm">
              <RadioGroupItem value={option.label} id={`answer-${option.label}`} />
              <div className="min-w-[20px] h-5 flex items-center justify-center rounded-full bg-background/70 backdrop-blur-sm border border-background/20 text-xs font-medium">
                {option.label}
              </div>
              <label htmlFor={`answer-${option.label}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 truncate">
                {option.text}
              </label>
            </div>
          ))}
        </RadioGroup>
      )
    }
  }

  // 格式化课程显示文本
  const formatCourseText = (course: Course) => {
    // 返回包含完整分类信息的课程文本
    let displayName = course.name;
    
    // 如果有分类信息，添加到课程名称前
    if (course.category_level1 && course.category_level2) {
      // 显示完整的分类层级
      displayName = `${course.category_level1}-${course.category_level2}: ${course.name}`;
    } else if (course.category_level1) {
      // 只有一级分类
      displayName = `${course.category_level1}: ${course.name}`;
    } else if (course.category_level2) {
      // 只有二级分类
      displayName = `${course.category_level2}: ${course.name}`;
    }
    
    return displayName;
  }

  // 获取当前选中课程
  const getSelectedCourse = () => {
    const courseId = form.watch('course_id');
    return courses.find(course => course.id === courseId);
  }

  // 处理删除题目
  const handleDelete = async () => {
    if (!currentRow) return;
    
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

  return (
    <>
      <BlurDialog open={open} onOpenChange={onOpenChange}>
        <BlurDialogContent className="sm:max-w-[650px] max-h-[85vh]">
          <DialogHeader className="text-left pb-2">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-foreground/90 text-lg">
                {isEditMode ? '编辑题目' : '新建题目'}
              </DialogTitle>
              {isEditMode && currentRow && (
                <div className="text-sm flex items-center gap-1 whitespace-nowrap shrink-0">
                  <IconId className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">ID: {currentRow.id}</span>
                </div>
              )}
            </div>
            <DialogDescription className="text-muted-foreground/90 text-xs">
              {isEditMode ? `正在编辑题目` : '创建新的题库题目'}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[65vh] pr-4 -mr-4 scrollbar-thin">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 pt-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* 题目类型 */}
                  <div className="space-y-2 p-2 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                    <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                      <IconAbc className="h-3 w-3" /> 题目类型
                    </h4>
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value)
                              handleTypeChange(value)
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-8 bg-background/80 border-background/20">
                                <SelectValue placeholder="选择题目类型" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={QuestionType.SINGLE}>单选题</SelectItem>
                              <SelectItem value={QuestionType.MULTIPLE}>多选题</SelectItem>
                              <SelectItem value={QuestionType.JUDGE}>判断题</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* 所属课程 */}
                  <div className="space-y-2 p-2 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                    <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                      <IconSchool className="h-3 w-3" /> 所属课程
                    </h4>
                    <FormField
                      control={form.control}
                      name="course_id"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <Select
                            onValueChange={(value) => field.onChange(Number(value))}
                            value={field.value > 0 ? field.value.toString() : ""}
                          >
                            <FormControl>
                              <SelectTrigger 
                                className="h-8 bg-background/80 border-background/20 overflow-hidden text-ellipsis whitespace-nowrap"
                                style={{ maxWidth: '100%' }}
                              >
                                {(field.value ?? 0) > 0 ? (
                                  <div className="flex items-center w-full max-w-[calc(100%-8px)]">
                                    <span className="truncate flex-1 mr-2">{getSelectedCourse() ? formatCourseText(getSelectedCourse()!) : ''}</span>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">(ID:{field.value})</span>
                                  </div>
                                ) : (
                                  <span className="truncate">选择所属课程</span>
                                )}
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[300px] w-auto min-w-[var(--radix-select-trigger-width)] max-w-[500px]">
                              {courses.map((course) => (
                                <SelectItem 
                                  key={course.id} 
                                  value={course.id.toString()}
                                  className="py-2 text-sm"
                                >
                                  <div className="flex items-center w-full">
                                    <span className="line-clamp-1 flex-1 mr-2">{formatCourseText(course)}</span>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">(ID:{course.id})</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Separator className="bg-foreground/10 my-1" />
                
                {/* 题目内容 */}
                <div className="space-y-2 p-2 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                  <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                    <IconBook className="h-3 w-3" /> 题目内容
                  </h4>
                  <FormField
                    control={form.control}
                    name="question"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormControl>
                          <Textarea
                            placeholder="请输入题目内容"
                            className="min-h-[70px] bg-background/80 border-background/20 text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* 选项 */}
                <div className="space-y-2 p-2 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                      <IconListCheck className="h-3 w-3" /> 选项
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddOption}
                      className="h-7 hover:bg-background/60 backdrop-blur-sm border-background/20 text-xs"
                      disabled={form.watch('type') === QuestionType.JUDGE}
                    >
                      <IconPlus className="h-3 w-3 mr-1" />
                      添加选项
                    </Button>
                  </div>
                  
                  <div className="space-y-1">
                    {form.watch('options').map((option, index) => (
                      <div key={index} className="flex items-center gap-1 p-1.5 rounded-md border border-background/20 bg-background/60 backdrop-blur-sm">
                        <div className="min-w-[20px] h-5 flex items-center justify-center rounded-full bg-background/70 backdrop-blur-sm border border-background/20 text-xs font-medium">
                          {option.label}
                        </div>
                        <FormField
                          control={form.control}
                          name={`options.${index}.text`}
                          render={({ field }) => (
                            <FormItem className="flex-1 m-0">
                              <FormControl>
                                <Input
                                  placeholder={`选项 ${option.label} 内容`}
                                  className="h-7 bg-background/80 border-background/20 text-sm"
                                  {...field}
                                  disabled={form.watch('type') === QuestionType.JUDGE}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOption(index)}
                          disabled={form.watch('options').length <= 2 || form.watch('type') === QuestionType.JUDGE}
                          className="h-7 w-7 hover:bg-background/60"
                        >
                          <IconTrash className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 正确答案 */}
                <div className="space-y-2 p-2 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                  <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                    <IconListCheck className="h-3 w-3" /> 正确答案
                  </h4>
                  <FormField
                    control={form.control}
                    name="answer"
                    render={() => (
                      <FormItem className="space-y-1">
                        <FormControl>
                          {renderAnswerControl()}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* 解析 */}
                <div className="space-y-2 p-2 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                  <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                    <IconFileDescription className="h-3 w-3" /> 题目解析（可选）
                  </h4>
                  <FormField
                    control={form.control}
                    name="explanation"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormControl>
                          <Textarea
                            placeholder="请输入题目解析"
                            className="min-h-[60px] bg-background/80 border-background/20 text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </ScrollArea>
          
          <DialogFooter className="mt-3">
            <div className="flex w-full justify-between items-center gap-2">
              {isEditMode && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="h-8 hover:bg-destructive/90 text-sm"
                >
                  <IconTrash className="h-3.5 w-3.5 mr-1" />
                  删除题目
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="h-8 hover:bg-background/60 backdrop-blur-sm border-background/20 text-sm"
                >
                  取消
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  onClick={form.handleSubmit(onSubmit)}
                  className={cn(
                    "h-8 gap-1 text-sm",
                    isLoading && "opacity-80 pointer-events-none"
                  )}
                >
                  {isLoading ? '提交中...' : isEditMode ? '更新' : '创建'}
                </Button>
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