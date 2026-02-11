import { useState, useEffect, useRef } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Course, ExamConfigItem, MockExamConfig } from '../data/schema'
import { useToast } from '@/components/ui/use-toast'
import { coursesApi } from '@/lib/api'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExamConfigEditor } from './exam-config-editor'
import { MockExamConfigEditor } from './mock-exam-config-editor'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { IconBook, IconCategoryPlus, IconSettings, IconClockHour4, IconTrash } from '@tabler/icons-react'
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

// 默认配置
const DEFAULT_EXAM_CONFIG: ExamConfigItem[] = [
  { type: 'single', count: 20, score: 2 },
  { type: 'multiple', count: 15, score: 2 },
  { type: 'judge', count: 15, score: 2 }
];

const DEFAULT_MOCK_EXAM_CONFIG: MockExamConfig = {
  min: 60,
  count: 50,
  score: 60
};

// 表单验证模式
const formSchema = z.object({
  name: z.string().min(2, {
    message: '课程名称至少需要2个字符',
  }),
  cover: z.string().url({
    message: '请输入有效的图片URL',
  }),
  price: z.coerce.number().min(0, {
    message: '价格不能为负数',
  }),
  description: z.string().optional(),
  category_level1: z.string().min(1, {
    message: '请输入一级分类',
  }),
  category_level2: z.string().min(1, {
    message: '请输入二级分类',
  }),
  category_sort1: z.coerce.number().min(0),
  category_sort2: z.coerce.number().min(0),
  expire_days: z.coerce.number().min(1, {
    message: '有效期天数不能小于1',
  }),
  sort: z.coerce.number().min(0),
  exam_config: z.array(
    z.object({
      type: z.string(),
      count: z.number(),
      score: z.number()
    })
  ),
  mock_exam_config: z.object({
    min: z.number(),
    count: z.number(),
    score: z.number()
  }),
})

type FormValues = z.infer<typeof formSchema>

interface CourseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course?: Course
  onSuccess?: () => void
}

export function CourseForm({ open, onOpenChange, course, onSuccess }: CourseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<FormValues | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const lastSubmitTimeRef = useRef<number>(0);
  const { toast } = useToast();
  const isEditing = !!course;
  const [activeTab, setActiveTab] = useState<string>("basic");

  // 解析课程的考试配置
  const parseExamConfig = (jsonStr?: string | any): ExamConfigItem[] => {
    console.log('解析练习配置输入:', jsonStr, typeof jsonStr);
    
    if (!jsonStr) return DEFAULT_EXAM_CONFIG;
    
    try {
      // 如果已经是数组，直接返回
      if (Array.isArray(jsonStr)) {
        console.log('exam_config已经是数组:', jsonStr);
        return jsonStr.length > 0 ? jsonStr : DEFAULT_EXAM_CONFIG;
      }
      
      // 如果是字符串，尝试解析JSON
      if (typeof jsonStr === 'string') {
        const parsed = JSON.parse(jsonStr);
        console.log('exam_config字符串解析结果:', parsed);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_EXAM_CONFIG;
      }
      
      // 如果是对象但不是数组，可能是API格式不一致
      if (typeof jsonStr === 'object') {
        console.log('exam_config是对象但不是数组:', jsonStr);
        // 尝试从对象中提取可能的数组
        for (const key in jsonStr) {
          if (Array.isArray(jsonStr[key]) && jsonStr[key].length > 0) {
            console.log('从对象中提取数组:', jsonStr[key]);
            return jsonStr[key];
          }
        }
      }
      
      console.log('无法解析exam_config，返回默认配置');
      return DEFAULT_EXAM_CONFIG;
    } catch (e) {
      console.error("解析练习配置失败:", e, jsonStr);
      return DEFAULT_EXAM_CONFIG;
    }
  };

  // 解析课程的模拟考试配置
  const parseMockExamConfig = (jsonStr?: string | any): MockExamConfig => {
    console.log('解析模拟考试配置输入:', jsonStr, typeof jsonStr);
    
    if (!jsonStr) return DEFAULT_MOCK_EXAM_CONFIG;
    
    try {
      // 如果已经是对象且有需要的字段，直接返回
      if (typeof jsonStr === 'object' && !Array.isArray(jsonStr) && jsonStr !== null) {
        if ('min' in jsonStr && 'count' in jsonStr && 'score' in jsonStr) {
          console.log('mock_exam_config已经是有效对象:', jsonStr);
          return jsonStr as MockExamConfig;
        }
      }
      
      // 如果是字符串，尝试解析JSON
      if (typeof jsonStr === 'string') {
        const parsed = JSON.parse(jsonStr);
        console.log('mock_exam_config字符串解析结果:', parsed);
        if (parsed && typeof parsed === 'object' && 'min' in parsed && 'count' in parsed && 'score' in parsed) {
          return parsed;
        }
      }
      
      console.log('无法解析mock_exam_config，返回默认配置');
      return DEFAULT_MOCK_EXAM_CONFIG;
    } catch (e) {
      console.error("解析模拟考试配置失败:", e, jsonStr);
      return DEFAULT_MOCK_EXAM_CONFIG;
    }
  };

  // 表单默认值
  const defaultValues: Partial<FormValues> = {
    name: course?.name || '',
    cover: course?.cover || '',
    price: course?.price || 0,
    description: course?.description || '',
    category_level1: course?.category_level1 || '',
    category_level2: course?.category_level2 || '',
    category_sort1: course?.category_sort1 || 0,
    category_sort2: course?.category_sort2 || 0,
    expire_days: course?.expire_days || 30,
    sort: course?.sort || 0,
    exam_config: parseExamConfig(course?.exam_config as any),
    mock_exam_config: parseMockExamConfig(course?.mock_exam_config as any),
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // 当课程数据变化时重置表单
  useEffect(() => {
    if (open) {
      form.reset({
        name: course?.name || '',
        cover: course?.cover || '',
        price: course?.price || 0,
        description: course?.description || '',
        category_level1: course?.category_level1 || '',
        category_level2: course?.category_level2 || '',
        category_sort1: course?.category_sort1 || 0,
        category_sort2: course?.category_sort2 || 0,
        expire_days: course?.expire_days || 30,
        sort: course?.sort || 0,
        exam_config: parseExamConfig(course?.exam_config as any),
        mock_exam_config: parseMockExamConfig(course?.mock_exam_config as any),
      });
    }
  }, [course, open, form]);

  // 在编辑模式下获取最新的课程详情
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (isEditing && course && open) {
        try {
          console.log(`获取课程${course.id}的详细信息`);
          const response = await coursesApi.getCourse(course.id) as any;
          
          if (response.code === 200 && response.data) {
            console.log('获取到课程详情:', response.data);
            // 使用获取到的最新数据更新表单
            form.reset({
              name: response.data.name || '',
              cover: response.data.cover || '',
              price: response.data.price || 0,
              description: response.data.description || '',
              category_level1: response.data.category_level1 || '',
              category_level2: response.data.category_level2 || '',
              category_sort1: response.data.category_sort1 || 0,
              category_sort2: response.data.category_sort2 || 0,
              expire_days: response.data.expire_days || 30,
              sort: response.data.sort || 0,
              exam_config: parseExamConfig(response.data.exam_config),
              mock_exam_config: parseMockExamConfig(response.data.mock_exam_config),
            });
          }
        } catch (error) {
          console.error('获取课程详情失败:', error);
        }
      }
    };
    
    fetchCourseDetails();
  }, [isEditing, course, open]);

  // 表单预提交处理
  const handlePreSubmit = (data: FormValues) => {
    // 防重复点击保护
    const now = Date.now();
    if (now - lastSubmitTimeRef.current < 1000 || isSubmitting) { // 1秒内不允许重复提交
      return;
    }
    lastSubmitTimeRef.current = now;

    // 验证配置是否完整
    if (!data.exam_config || data.exam_config.length === 0) {
      toast({
        variant: "destructive",
        title: "练习配置不完整",
        description: "请至少添加一种题型",
      });
      setActiveTab("exam");
      return;
    }

    // 验证模拟考试配置
    if (!data.mock_exam_config) {
      data.mock_exam_config = DEFAULT_MOCK_EXAM_CONFIG;
    }

    // 存储表单数据并显示确认对话框
    setFormDataToSubmit(data);
    setShowConfirmDialog(true);
  };

  const onSubmit = async (data: FormValues) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // 确保模拟考试配置存在
      if (!data.mock_exam_config) {
        data.mock_exam_config = DEFAULT_MOCK_EXAM_CONFIG;
      }
      
      // 确保考试配置存在
      if (!data.exam_config || data.exam_config.length === 0) {
        data.exam_config = DEFAULT_EXAM_CONFIG;
      }
      
      // 直接发送对象，不转换为JSON字符串
      const formattedData = {
        ...data
      };

      console.log('提交的课程数据:', formattedData);

      if (isEditing && course) {
        // 编辑现有课程
        const response = await coursesApi.updateCourse(course.id, formattedData) as any
        if (response.code === 200) {
          toast({
            title: "课程更新成功",
            description: "课程信息已更新",
          })
          onOpenChange(false)
          onSuccess?.()
        } else {
          toast({
            variant: "destructive",
            title: "课程更新失败",
            description: response.msg || response.message || "更新课程时出现错误",
          })
        }
      } else {
        // 创建新课程
        const response = await coursesApi.createCourse(formattedData) as any
        if (response.code === 200) {
          toast({
            title: "课程创建成功",
            description: "新课程已添加",
          })
          form.reset()
          onOpenChange(false)
          onSuccess?.()
        } else {
          toast({
            variant: "destructive",
            title: "课程创建失败",
            description: response.msg || response.message || "创建课程时出现错误",
          })
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "操作失败",
        description: "提交课程时出现错误",
      })
      console.error("课程提交错误:", error);
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
      setFormDataToSubmit(null);
    }
  }

  // 取消提交
  const handleCancelSubmit = () => {
    setShowConfirmDialog(false);
    setFormDataToSubmit(null);
    setIsSubmitting(false);
  };

  // 确认提交
  const handleConfirmSubmit = () => {
    if (formDataToSubmit) {
      onSubmit(formDataToSubmit);
    }
  };

  // 处理删除课程
  const handleDelete = async () => {
    if (!course) return;
    
    setIsDeleting(true);
    
    try {
      const response = await coursesApi.deleteCourse(course.id);
      
      if (response.code === 200) {
        toast({
          title: "课程删除成功",
          description: "课程已成功删除",
        });
        setIsDeleteDialogOpen(false);
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast({
          variant: "destructive",
          title: "删除失败",
          description: response.msg || "操作失败，请重试",
        });
      }
    } catch (error) {
      console.error('删除课程失败:', error);
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
      <BlurDialog open={open} onOpenChange={(newOpen) => {
        // 如果正在提交，阻止关闭
        if (isSubmitting) return;
        onOpenChange(newOpen);
      }}>
        <BlurDialogContent className='sm:max-w-lg max-h-[90vh] p-4 sm:p-6'>
          <DialogHeader className='text-left pb-2'>
            <DialogTitle className="text-foreground/90 text-xl">{isEditing ? '编辑课程' : '添加新课程'}</DialogTitle>
            <DialogDescription className="text-muted-foreground/90">
              {isEditing ? `正在编辑课程 ${course?.name}` : '在此处创建新课程。'}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[65vh] pr-4 -mr-4 scrollbar-thin">
            <Form {...form}>
              <form 
                id="course-form"
                onSubmit={form.handleSubmit(handlePreSubmit)} 
                className="space-y-4 py-2"
              >
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="basic" className="flex items-center gap-1">
                      <IconBook className="h-3.5 w-3.5" />
                      <span>基本信息</span>
                    </TabsTrigger>
                    <TabsTrigger value="exam" className="flex items-center gap-1">
                      <IconSettings className="h-3.5 w-3.5" />
                      <span>练习配置</span>
                    </TabsTrigger>
                    <TabsTrigger value="mockExam" className="flex items-center gap-1">
                      <IconClockHour4 className="h-3.5 w-3.5" />
                      <span>模拟考试</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <div className="space-y-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                      <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                        <IconBook className="h-3.5 w-3.5" /> 课程基本信息
                      </h4>
                      
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>课程名称</FormLabel>
                            <FormControl>
                              <Input placeholder="输入课程名称" className="bg-background/80 border-background/20" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cover"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>封面图片URL</FormLabel>
                            <FormControl>
                              <Input placeholder="输入封面图片URL" className="bg-background/80 border-background/20" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>价格</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="输入课程价格" 
                                className="bg-background/80 border-background/20"
                                {...field} 
                                onKeyDown={(e) => {
                                  // 防止Enter键提交表单
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>课程描述</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="输入课程描述"
                                rows={3}
                                className="bg-background/80 border-background/20"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                      <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                        <IconCategoryPlus className="h-3.5 w-3.5" /> 分类与排序
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="category_level1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>一级分类</FormLabel>
                              <FormControl>
                                <Input placeholder="输入一级分类" className="bg-background/80 border-background/20" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="category_level2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>二级分类</FormLabel>
                              <FormControl>
                                <Input placeholder="输入二级分类" className="bg-background/80 border-background/20" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="category_sort1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>一级分类排序</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="输入排序数字" 
                                  className="bg-background/80 border-background/20"
                                  {...field}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') e.preventDefault();
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="category_sort2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>二级分类排序</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="输入排序数字" 
                                  className="bg-background/80 border-background/20"
                                  {...field}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') e.preventDefault();
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="expire_days"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>有效期(天)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="输入有效天数" 
                                  className="bg-background/80 border-background/20"
                                  {...field}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') e.preventDefault();
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="sort"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>课程排序</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="输入排序数字" 
                                  className="bg-background/80 border-background/20"
                                  {...field}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') e.preventDefault();
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="exam">
                    <div className="p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                      <FormField
                        control={form.control}
                        name="exam_config"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>练习配置</FormLabel>
                            <FormDescription>
                              配置练习模式的题型、数量和分数
                            </FormDescription>
                            <FormControl>
                              <ExamConfigEditor 
                                value={field.value ?? []} 
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="mockExam">
                    <div className="p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                      <FormField
                        control={form.control}
                        name="mock_exam_config"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>模拟考试配置</FormLabel>
                            <FormDescription>
                              配置模拟考试的参数
                            </FormDescription>
                            <FormControl>
                              <MockExamConfigEditor 
                                value={field.value ?? null} 
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </form>
            </Form>
          </ScrollArea>
              
          <DialogFooter className="mt-4">
            <div className="flex w-full justify-between items-center">
              {isEditing && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="h-8 hover:bg-destructive/90 text-sm"
                >
                  <IconTrash className="h-3.5 w-3.5 mr-1" />
                  <span>删除课程</span>
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="h-9 hover:bg-background/60 backdrop-blur-sm border-background/20"
                >
                  取消
                </Button>
                <Button 
                  type="submit" 
                  form="course-form"
                  disabled={isSubmitting}
                  className={cn(
                    "h-9",
                    isSubmitting && "opacity-80 pointer-events-none"
                  )}
                >
                  {isSubmitting ? '提交中...' : isEditing ? '更新' : '创建'}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </BlurDialogContent>
      </BlurDialog>

      {/* 确认提交对话框 */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle>{isEditing ? '确认更新课程' : '确认创建课程'}</AlertDialogTitle>
            <AlertDialogDescription>
              {isEditing 
                ? '您确定要保存对课程的修改吗？此操作将更新课程信息。' 
                : '您确定要创建这个新课程吗？请确认所有信息都已正确填写。'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelSubmit} disabled={isSubmitting} className="h-9">取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmSubmit} 
              disabled={isSubmitting}
              className={cn(
                "h-9",
                isSubmitting && "opacity-80 pointer-events-none"
              )}
            >
              {isSubmitting ? '提交中...' : '确认'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 删除确认对话框 */}
      {isEditing && course && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="max-w-[400px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive flex items-center">
                <IconTrash className="h-5 w-5 mr-2" />
                确认删除课程
              </AlertDialogTitle>
              <AlertDialogDescription>
                您确定要删除课程 <span className="font-medium">{course.name}</span> 吗？此操作不可撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                className="h-9" 
                disabled={isDeleting}
              >
                取消
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className={cn(
                  "bg-destructive hover:bg-destructive/90 text-white h-9",
                  isDeleting && "opacity-80 pointer-events-none"
                )}
                disabled={isDeleting}
              >
                {isDeleting ? "删除中..." : "确认删除"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
} 