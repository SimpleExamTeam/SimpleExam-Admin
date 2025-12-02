import { useState, useRef, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { createColumns } from './components/questions-columns'
import { QuestionsTable } from './components/questions-table'
import { Button } from '@/components/ui/button'
import { IconPlus, IconRefresh, IconFileExport, IconFileUpload, IconTrash } from '@tabler/icons-react'
import { Question, QuestionList, questionListSchema } from './data/schema'
import { questionsApi, coursesApi, useDeduplicatedEffect } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { QuestionsViewDialog } from './components/questions-view-dialog'
import { QuestionsEditDialog } from './components/questions-edit-dialog'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { QuestionsBatchDeleteDialog } from './components/questions-batch-delete-dialog'
import { Search } from '@/components/search'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollToTop } from '@/components/scroll-to-top'

// 可选的每页数据条数
export const PAGE_SIZE_OPTIONS = [10, 50, 100, 200] as const;
export type PageSizeOption = typeof PAGE_SIZE_OPTIONS[number];

// 搜索参数接口
interface QuestionSearchParams {
  question?: string;
  question_id?: number;
  type?: string;
  course_id?: number;
  category_level1?: string;
  page?: number;
  size?: number;
}

export default function Questions() {
  const [isLoading, setIsLoading] = useState(true)
  const [questionList, setQuestionList] = useState<QuestionList | null>(null)
  const [searchParams, setSearchParams] = useState<QuestionSearchParams>({
    page: 1,
    size: 10
  })
  const [questionType, setQuestionType] = useState('')
  const [categoryLevel1, setCategoryLevel1] = useState<string>('')
  const [categoryList, setCategoryList] = useState<string[]>([])
  const [courseId, setCourseId] = useState<number | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSizeOption>(10)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [courses, setCourses] = useState<Array<{ id: number; name: string }>>([])
  const { toast } = useToast()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null)
  const [selectedRows, setSelectedRows] = useState<Question[]>([])
  const [isBatchDeleteDialogOpen, setIsBatchDeleteDialogOpen] = useState(false)
  const [isBatchDeleteLoading, setIsBatchDeleteLoading] = useState(false)
  const resetSelectionRef = useRef<() => void>(null)
  
  // 监听来自其他页面的题目ID搜索请求
  useEffect(() => {
    const handleSearchQuestionById = (event: CustomEvent) => {
      const { questionId } = event.detail;
      if (questionId) {
        console.log('收到题目ID搜索请求:', questionId);
        // 重置筛选条件
        setQuestionType('');
        setCategoryLevel1('');
        setCourseId(undefined);
        
        // 设置搜索参数并触发搜索
        const params: QuestionSearchParams = { question_id: questionId };
        handleSearch(params);
      }
    };
    
    // 添加自定义事件监听器
    document.addEventListener('search-question-by-id', handleSearchQuestionById as EventListener);
    
    // 组件卸载时移除事件监听器
    return () => {
      document.removeEventListener('search-question-by-id', handleSearchQuestionById as EventListener);
    };
  }, [toast]);

  // 获取题库列表
  const fetchQuestions = async (params: QuestionSearchParams = {}) => {
    // 先设置加载状态
    setIsLoading(true)
    
    try {
      // 如果是按题目ID搜索，则直接使用ID接口获取题目
      if (params.question_id) {
        console.log('fetchQuestions: 使用ID接口直接获取题目, ID =', params.question_id);
        const response = await questionsApi.getQuestionById(params.question_id);
        
        if (response.code === 200) {
          // 将单个题目转换为列表格式
          const adaptedData = {
            items: response.data ? [response.data] : [],
            total: response.data ? 1 : 0
          }
          try {
            const parsedData = questionListSchema.parse(adaptedData)
            setQuestionList(parsedData)
          } catch (error) {
            console.error('题目数据解析错误:', error)
            toast({
              variant: "destructive",
              title: "数据格式错误",
              description: "题目数据格式不符合预期",
            })
          }
        } else {
          toast({
            variant: "destructive",
            title: "获取题目失败",
            description: response.msg || "加载题目时出现错误",
          })
        }
      } else {
        // 构建请求参数，过滤掉空值
        const requestParams: QuestionSearchParams = {};
        
        // 不是按题目ID搜索时，添加分页参数
        requestParams.page = params.page || currentPage;
        requestParams.size = params.size || pageSize;
        
        // 添加其他搜索参数 - 只添加非空值
        if (params.question) {
          requestParams.question = params.question;
        }
        
        if (params.type) {
          requestParams.type = params.type;
        }
        
        if (params.course_id) {
          requestParams.course_id = params.course_id;
        }
        
        if (params.category_level1) {
          requestParams.category_level1 = params.category_level1;
        }
        
        console.log('题库请求参数:', requestParams);
        
        const response = await questionsApi.getQuestions(requestParams)
        
        if (response.code === 200) {
          const adaptedData = {
            items: response.data.items || [],
            total: response.data.total || 0
          }
          try {
            const parsedData = questionListSchema.parse(adaptedData)
            setQuestionList(parsedData)
          } catch (error) {
            console.error('题库数据解析错误:', error)
            toast({
              variant: "destructive",
              title: "数据格式错误",
              description: "题库数据格式不符合预期",
            })
          }
        } else {
          toast({
            variant: "destructive",
            title: "获取题库失败",
            description: response.msg || "加载题库列表时出现错误",
          })
        }
      }
    } catch (error) {
      console.error('获取题库错误:', error)
      toast({
        variant: "destructive",
        title: "获取题库失败",
        description: "加载题库列表时出现错误",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 获取课程列表（用于过滤）
  const fetchCourses = async () => {
    try {
      const response = await coursesApi.getCourses({
        size: 100, // 获取较多课程用于筛选
      })
      
      if (response.code === 200 && response.data?.items) {
        const courseOptions = response.data.items.map((course: any) => ({
          id: course.id,
          name: course.category_level2 + ' - ' + course.name,
        }))
        setCourses(courseOptions)
        
        // 从课程数据中提取一级分类
        const uniqueCategories = new Set<string>();
        response.data.items.forEach((course: any) => {
          if (course.category_level1) {
            uniqueCategories.add(course.category_level1);
          }
        });
        setCategoryList(Array.from(uniqueCategories).sort());
      }
    } catch (error) {
      console.error('获取课程列表错误:', error)
    }
  }

  // 使用去重效果钩子替换原有的useEffect
  useDeduplicatedEffect(() => {
    // 创建一个新的搜索参数对象，包含当前页码和页面大小
    const updatedParams = {
      ...searchParams,
      page: currentPage,
      size: pageSize
    };
    fetchQuestions(updatedParams);
  }, [currentPage, pageSize, searchParams], { dedupTime: 300 })

  // 初始加载时获取课程列表
  useDeduplicatedEffect(() => {
    fetchCourses()
  }, [], { dedupTime: 300 })

  // 搜索处理
  const handleSearch = (params: QuestionSearchParams) => {
    // 创建一个新的搜索参数对象，只包含有值的参数
    const newParams: QuestionSearchParams = { page: 1 }; // 重置页码
    
    // 只添加有值的参数
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        newParams[key as keyof QuestionSearchParams] = value;
        // 特别记录题目ID参数
        if (key === 'question_id') {
          console.log('handleSearch: 添加question_id参数 =', value);
        }
      }
    });
    
    console.log('新的搜索参数:', newParams);
    
    // 保存搜索参数 - 完全替换而不是合并
    setSearchParams(newParams);
    // 重置页码
    setCurrentPage(1);
    
    // 如果有类型参数，同步更新类型状态
    if (params.type) {
      setQuestionType(params.type);
    }
  }

  // 类型筛选处理
  const handleTypeFilter = (type: string) => {
    // 确保类型值转换正确
    const newType = type === "all" ? "" : type;
    if (newType !== questionType) {
      setQuestionType(newType);
      setCurrentPage(1); // 筛选时重置到第一页
      
      // 更新搜索参数
      const newParams = { ...searchParams, type: newType, page: 1 };
      setSearchParams(newParams);
    }
  }

  // 一级分类筛选处理
  const handleCategoryFilter = (category: string) => {
    // 确保类型值转换正确
    const newCategory = category === "all" ? "" : category;
    if (newCategory !== categoryLevel1) {
      setCategoryLevel1(newCategory);
      setCurrentPage(1); // 筛选时重置到第一页
      
      // 更新搜索参数
      const newParams = { ...searchParams, category_level1: newCategory, page: 1 };
      setSearchParams(newParams);
    }
  }

  // 课程筛选处理
  const handleCourseFilter = (value: string) => {
    // 确保类型转换正确
    const newCourseId = value === "0" ? undefined : Number(value);
    if (newCourseId !== courseId) {
      setCourseId(newCourseId);
      setCurrentPage(1); // 筛选时重置到第一页
      
      // 更新搜索参数
      const newParams = { ...searchParams, course_id: newCourseId, page: 1 };
      setSearchParams(newParams);
    }
  }

  // 每页条数变更处理
  const handlePageSizeChange = (size: PageSizeOption) => {
    setPageSize(size);
    setCurrentPage(1); // 改变每页条数时重置到第一页
    
    // 更新搜索参数中的size
    const newParams = { ...searchParams, size, page: 1 };
    setSearchParams(newParams);
  };

  // 处理页面变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 不需要在这里调用fetchQuestions，由useDeduplicatedEffect处理
  };

  // 查看题目详情
  const handleViewQuestion = (question: Question) => {
    setSelectedQuestion(question)
    setIsViewDialogOpen(true)
  }

  // 新建题目
  const handleCreateQuestion = () => {
    setQuestionToEdit(null)
    setIsEditDialogOpen(true)
  }

  // 编辑题目
  const handleEditQuestion = (question: Question) => {
    setQuestionToEdit(question)
    setIsEditDialogOpen(true)
  }

  // 删除题目
  const handleDeleteQuestion = (question: Question) => {
    setQuestionToDelete(question)
    setIsDeleteDialogOpen(true)
  }

  // 确认删除题目
  const handleConfirmDelete = async () => {
    if (!questionToDelete) return

    setIsDeleteLoading(true)
    try {
      const response = await questionsApi.deleteQuestion(questionToDelete.id)
      if (response.code === 200) {
        toast({
          title: "题目已删除",
          description: "题目已被成功删除",
        })
        fetchQuestions()
      } else {
        toast({
          variant: "destructive",
          title: "删除题目失败",
          description: response.msg || "删除题目时出现错误",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "删除题目失败",
        description: "删除题目时出现错误",
      })
    } finally {
      setIsDeleteLoading(false)
      setIsDeleteDialogOpen(false)
      setQuestionToDelete(null)
    }
  }

  // 导出题库
  const handleExport = async (exportCourseId?: number) => {
    try {
      // 使用传入的课程ID或当前选择的课程ID
      const targetCourseId = exportCourseId !== undefined ? exportCourseId : courseId;
      const blob = await questionsApi.exportQuestions(targetCourseId);
      
      // 确定文件名（如果有课程ID，添加课程名称）
      let fileName = `题库导出_${new Date().toISOString().split('T')[0]}`;
      if (targetCourseId) {
        const selectedCourse = courses.find(c => c.id === targetCourseId);
        if (selectedCourse) {
          fileName += `_${selectedCourse.name}`;
        }
      }
      fileName += '.csv';
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "导出成功",
        description: `题库已成功导出为CSV文件${targetCourseId ? '（指定课程）' : '（全部课程）'}`,
      });
    } catch (error) {
      console.error('导出题库失败:', error);
      toast({
        variant: "destructive",
        title: "导出失败",
        description: "导出题库时出现错误",
      });
    }
  };

  // 导入题库
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        // 导入到当前选择的课程
        const response = await questionsApi.importQuestions(file, courseId);
        if (response.code === 200) {
          toast({
            title: "导入成功",
            description: `成功导入 ${response.data?.import_count || 0} 条题目${courseId ? '（到指定课程）' : ''}`,
          });
          fetchQuestions();
        } else {
          toast({
            variant: "destructive",
            title: "导入失败",
            description: response.msg || "导入题库时出现错误",
          });
        }
      } catch (error) {
        console.error('导入题库失败:', error);
        toast({
          variant: "destructive",
          title: "导入失败",
          description: "导入题库时出现错误",
        });
      }
    };
    input.click();
  };

  // 批量删除题目
  const handleBatchDelete = () => {
    if (selectedRows.length === 0) {
      toast({
        variant: "destructive",
        title: "请先选择题目",
        description: "请至少选择一个题目进行删除",
      })
      return
    }
    setIsBatchDeleteDialogOpen(true)
  }

  // 确认批量删除题目
  const handleConfirmBatchDelete = async () => {
    if (selectedRows.length === 0) return

    console.log('开始批量删除, 选中ID:', selectedRows.map(row => row.id))
    setIsBatchDeleteLoading(true)
    
    try {
      const ids = selectedRows.map(row => row.id)
      console.log('发送批量删除请求:', { ids })
      const response = await questionsApi.batchDeleteQuestions(ids)
      console.log('批量删除响应:', response)
      
      if (response.code === 200) {
        // 关闭对话框并停止加载状态
        setIsBatchDeleteDialogOpen(false)
        setIsBatchDeleteLoading(false)
        
        // 重置选择状态
        if (resetSelectionRef.current) {
          resetSelectionRef.current();
        }
        setSelectedRows([])
        
        toast({
          title: "批量删除成功",
          description: `已成功删除 ${response.data?.deleted_count || selectedRows.length} 道题目`,
        })
        
        // 使用延迟刷新数据，确保状态更新完成
        setTimeout(() => {
          if (questionList && questionList.items.length <= ids.length && currentPage > 1) {
            // 如果删除的是当前页所有数据，且不是第一页，则跳转到上一页
            setCurrentPage(currentPage - 1)
          } else {
            // 否则刷新当前页
            fetchQuestions()
          }
        }, 300)
      } else {
        setIsBatchDeleteLoading(false)
        setIsBatchDeleteDialogOpen(false)
        
        toast({
          variant: "destructive",
          title: "批量删除失败",
          description: response.msg || "删除题目时出现错误",
        })
      }
    } catch (error) {
      console.error('批量删除题目失败:', error)
      
      setIsBatchDeleteLoading(false)
      setIsBatchDeleteDialogOpen(false)
      
      toast({
        variant: "destructive",
        title: "批量删除失败",
        description: "删除题目时出现错误",
      })
    }
  }

  // 处理行选择变更
  const handleRowSelectionChange = (rows: Question[]) => {
    // 确保我们收到有效的行数组
    if (!Array.isArray(rows)) {
      return;
    }
    
    // 避免不必要的状态更新
    if (rows.length === selectedRows.length) {
      const currentIds = rows.map(row => row.id).sort().join(',');
      const prevIds = selectedRows.map(row => row.id).sort().join(',');
      
      if (currentIds === prevIds) {
        return; // 选择没有变化，不更新
      }
    }
    
    // 添加防抖处理，避免快速连续更新
    const newSelectedRows = [...rows];
    setSelectedRows(newSelectedRows);
  }
  
  // 处理刷新按钮点击
  const handleRefresh = () => {
    // 先设置加载状态
    setIsLoading(true);
    
    // 重置选择状态
    setSelectedRows([]);
    
    // 重置搜索参数
    const newParams = { page: 1, size: pageSize };
    setSearchParams(newParams);
    
    // 重置筛选条件
    setQuestionType('');
    setCategoryLevel1('');
    setCourseId(undefined);
    
    // 重置页码
    setCurrentPage(1);
    
    // 触发行选择重置
    if (resetSelectionRef.current) {
      resetSelectionRef.current();
    }
    
    // 刷新数据
    fetchQuestions(newParams);
  }

  // 创建列定义，传入动作处理函数
  const columns = createColumns({
    onView: handleViewQuestion,
    onEdit: handleEditQuestion,
    onDelete: handleDeleteQuestion,
  })

  return (
    <>
      <Header fixed>
        <Search placeholder="搜索..." />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>题库管理</h2>
            <p className='text-muted-foreground'>
              管理课程的考试题目
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleCreateQuestion}>
              <IconPlus className="mr-2 h-4 w-4" />
              新建题目
            </Button>
            {selectedRows.length > 0 && (
              <Button variant="destructive" onClick={handleBatchDelete}>
                <IconTrash className="mr-2 h-4 w-4" />
                批量删除 ({selectedRows.length})
              </Button>
            )}
            <Button variant="outline" onClick={handleRefresh} className="space-x-1">
              <span>刷新</span> <IconRefresh size={18} />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <Select
            onValueChange={handleCategoryFilter}
            defaultValue="all"
            value={categoryLevel1 || "all"}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择一级分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              {categoryList.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={handleCourseFilter}
            defaultValue="0"
            value={courseId ? courseId.toString() : "0"}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="选择课程" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">全部课程</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <IconFileExport className="mr-2 h-4 w-4" />
                  导出题库
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport()}>
                  导出全部题库
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {courseId && (
                  <DropdownMenuItem onClick={() => handleExport(courseId)}>
                    导出当前选中课程题库
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" onClick={handleImport} className="flex items-center">
              <IconFileUpload className="mr-2 h-4 w-4" />
              导入题库
            </Button>
          </div>
        </div>
        
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {questionList && (
            <QuestionsTable 
              data={questionList.items} 
              columns={columns} 
              isLoading={isLoading}
              pageCount={Math.ceil(questionList.total / pageSize)}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onSearch={handleSearch}
              onTypeFilter={handleTypeFilter}
              currentType={questionType}
              onCourseFilter={handleCourseFilter}
              pageSize={pageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onRowSelectionChange={handleRowSelectionChange}
              selectedRows={selectedRows}
              onResetSelection={(resetFn) => {
                resetSelectionRef.current = resetFn;
              }}
              onViewQuestion={handleViewQuestion}
            />
          )}
        </div>
      </Main>

      <ScrollToTop zIndex={100} />

      {/* 题目查看对话框 */}
      {selectedQuestion && (
        <QuestionsViewDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          currentRow={selectedQuestion}
          onSuccess={fetchQuestions}
          onEdit={handleEditQuestion}
        />
      )}

      {/* 编辑题目对话框 */}
      <QuestionsEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        currentRow={questionToEdit}
        onSuccess={fetchQuestions}
      />

      {/* 删除确认对话框 */}
      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="确认删除题目"
        description={
          questionToDelete ? (
            <>
              您确定要删除这个题目吗？此操作不可逆。
              <div className="mt-2 p-2 bg-muted rounded-md">
                <div className="font-medium">题目内容:</div>
                <div className="text-sm">{questionToDelete.question}</div>
              </div>
            </>
          ) : "您确定要删除这个题目吗？"
        }
        onConfirm={handleConfirmDelete}
        isLoading={isDeleteLoading}
      />

      {/* 批量删除确认对话框 */}
      <QuestionsBatchDeleteDialog
        open={isBatchDeleteDialogOpen}
        onOpenChange={setIsBatchDeleteDialogOpen}
        selectedRows={selectedRows}
        onConfirm={handleConfirmBatchDelete}
        isLoading={isBatchDeleteLoading}
      />
    </>
  )
} 