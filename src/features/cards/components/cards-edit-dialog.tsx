import { useState, useEffect } from 'react'
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  BlurDialog,
  BlurDialogContent,
} from '@/components/ui/blur-dialog'
import { Card } from '../data/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { cardsApi } from '@/lib/api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { IconCreditCard, IconCoin, IconCalendar, IconId, IconTicket } from '@tabler/icons-react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// 定义课程数据接口，匹配API返回的实际数据结构
interface Course {
  id: number
  name: string
  category_level1?: string
  category_level2?: string
}

// 表单验证模式
const formSchema = z.object({
  course_id: z.number(),
  amount: z.coerce.number().min(0, {
    message: '金额不能为负数',
  }),
  expire_days: z.coerce.number().min(1, {
    message: '有效期必须大于0',
  }),
  total: z.coerce.number().min(1, {
    message: '总数量必须大于0',
  }),
})

type FormValues = z.infer<typeof formSchema>

interface CardsEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Card | null
  courses: Array<Course>
  onSuccess: (params?: any) => void
}

export function CardsEditDialog({
  open,
  onOpenChange,
  currentRow,
  courses,
  onSuccess,
}: CardsEditDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // 表单默认值
  const defaultValues: Partial<FormValues> = {
    course_id: currentRow?.course_id ?? 0,
    amount: currentRow?.amount || 0,
    expire_days: currentRow?.expire_days || 30,
    total: currentRow?.total || 50,
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // 当对话框打开或currentRow变化时，重置表单数据
  useEffect(() => {
    if (open && !isLoading) {
      if (currentRow) {
        form.reset({
          course_id: currentRow.course_id ?? 0,
          amount: currentRow.amount,
          expire_days: currentRow.expire_days,
          total: currentRow.total,
        })
      } else {
        form.reset({
          course_id: 0,
          amount: 0,
          expire_days: 30,
          total: 50,
        })
      }
    }
  }, [open, currentRow, isLoading, courses, form])

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

  // 处理表单提交
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)

    try {
      let response
      
      if (currentRow) {
        // 更新卡券
        response = await cardsApi.updateCard(currentRow.id, data)
      } else {
        // 创建卡券
        response = await cardsApi.createCard(data)
      }

      if (response.code === 200) {
        toast({
          title: currentRow ? '更新成功' : '创建成功',
          description: currentRow 
            ? `卡券 ${currentRow.card_no} 已更新` 
            : `卡券 ${response.data.card_no} 已创建`,
        })
        onOpenChange(false)
        onSuccess()
      } else {
        toast({
          variant: 'destructive',
          title: currentRow ? '更新失败' : '创建失败',
          description: response.msg || '操作失败',
        })
      }
    } catch (error) {
      console.error('卡券操作错误:', error)
      toast({
        variant: 'destructive',
        title: currentRow ? '更新失败' : '创建失败',
        description: '操作过程中出现错误',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <BlurDialog 
      open={open} 
      onOpenChange={(value) => !isLoading && onOpenChange(value)}
    >
      <BlurDialogContent className="sm:max-w-[550px] max-h-[90vh] p-4 sm:p-6">
        <DialogHeader className="text-left pb-2">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-foreground/90 text-lg">
              {currentRow ? '编辑卡券' : '创建卡券'}
            </DialogTitle>
            {currentRow && (
              <div className="text-sm flex items-center gap-1 whitespace-nowrap shrink-0">
                <IconId className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">ID: {currentRow.id}</span>
              </div>
            )}
          </div>
          <DialogDescription className="text-muted-foreground/90 text-xs">
            {currentRow ? `正在编辑卡券 ${currentRow.card_no}` : '在此处创建新卡券'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-4 -mr-4 scrollbar-thin">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 py-2">
              <div className="space-y-2 p-2 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                  <IconCreditCard className="h-3 w-3" /> 课程信息
                </h4>
                <FormField
                  control={form.control}
                  name="course_id"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        disabled={isLoading}
                        value={field.value ? field.value.toString() : "0"}
                        onValueChange={(value) => field.onChange(parseInt(value))}
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
                              <span className="truncate">全部课程</span>
                            )}
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px] w-auto min-w-[var(--radix-select-trigger-width)] max-w-[500px]">
                          <SelectItem value="0" className="py-2 text-sm">
                            <div className="flex items-center w-full">
                              <span className="line-clamp-1 flex-1 mr-2">全部课程</span>
                            </div>
                          </SelectItem>
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

              <Separator className="bg-foreground/10 my-1" />

              <div className="space-y-2 p-2 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                  <IconCoin className="h-3 w-3" /> 金额信息
                </h4>
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">金额 (元)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          disabled={isLoading}
                          className="h-8 bg-background/80 border-background/20 text-sm"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 卡券数量信息 */}
              <div className="space-y-2 p-2 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                  <IconTicket className="h-3 w-3" /> 数量信息
                </h4>
                <FormField
                  control={form.control}
                  name="total"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">总数量</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          disabled={isLoading}
                          className="h-8 bg-background/80 border-background/20 text-sm"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2 p-2 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                  <IconCalendar className="h-3 w-3" /> 有效期信息
                </h4>
                <FormField
                  control={form.control}
                  name="expire_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">有效期 (天)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          disabled={isLoading}
                          className="h-8 bg-background/80 border-background/20 text-sm"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="mt-6 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                  className="h-8 hover:bg-background/60 backdrop-blur-sm border-background/20 text-sm"
                >
                  取消
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className={cn(
                    "h-8 gap-1 text-sm",
                    isLoading && "opacity-80 pointer-events-none"
                  )}
                >
                  {isLoading ? '处理中...' : currentRow ? '更新' : '创建'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </BlurDialogContent>
    </BlurDialog>
  )
} 