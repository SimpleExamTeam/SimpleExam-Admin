import { useState, useRef } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { createColumns } from './components/courses-columns'
import { CoursesTable } from './components/courses-table'
import { Button } from '@/components/ui/button'
import { IconPlus, IconRefresh } from '@tabler/icons-react'
import { Course, CourseList, courseListSchema } from './data/schema'
import { coursesApi, useDeduplicatedEffect } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { CourseForm } from './components/course-form'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { Search } from '@/components/search'
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
import { ScrollToTop } from '@/components/scroll-to-top'

// 可选的每页数据条数
export const PAGE_SIZE_OPTIONS = [10, 50, 100, 200] as const;
export type PageSizeOption = typeof PAGE_SIZE_OPTIONS[number];

export default function Courses() {
  const [isLoading, setIsLoading] = useState(true)
  const [courseList, setCourseList] = useState<CourseList | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSizeOption>(10)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>(undefined)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)
  const [isStatusUpdateDialogOpen, setIsStatusUpdateDialogOpen] = useState(false)
  const [courseToUpdate, setCourseToUpdate] = useState<{course: Course, action: 'publish' | 'archive'} | null>(null)
  const resetSelectionRef = useRef<(() => void) | null>(null)
  const { toast } = useToast()

  const fetchCourses = async () => {
    setIsLoading(true)
    try {
      const response = await coursesApi.getCourses({
        page: currentPage,
        size: pageSize,
        keyword: searchKeyword || undefined,
      })
      
      console.log('课程API响应:', response)
      
      if (response.code === 200) {
        const adaptedData = {
          items: response.data.items || [],
          total: response.data.total || 0
        }
        try {
          const parsedData = courseListSchema.parse(adaptedData)
          setCourseList(parsedData)
        } catch (error) {
          console.error('课程数据解析错误:', error)
          toast({
            variant: "destructive",
            title: "数据格式错误",
            description: "课程数据格式不符合预期",
          })
        }
      } else {
        toast({
          variant: "destructive",
          title: "获取课程失败",
          description: response.msg || response.message || "加载课程列表时出现错误",
        })
      }
    } catch (error) {
      console.error('获取课程错误:', error)
      toast({
        variant: "destructive",
        title: "获取课程失败",
        description: "加载课程列表时出现错误",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 使用去重效果钩子替换原有的useEffect
  useDeduplicatedEffect(() => {
    fetchCourses()
  }, [currentPage, pageSize, searchKeyword], { dedupTime: 300 })

  const handleSearch = (value: string) => {
    setSearchKeyword(value)
    setCurrentPage(1) // 搜索时重置到第一页
  }

  const handlePageSizeChange = (size: PageSizeOption) => {
    setPageSize(size);
    setCurrentPage(1); // 改变每页条数时重置到第一页
  };

  const handleAddCourse = () => {
    setSelectedCourse(undefined)
    setIsFormOpen(true)
  }

  const handleEditCourse = (course: Course) => {
    console.log('编辑课程，原始数据:', course);
    console.log('考试配置:', course.exam_config, typeof course.exam_config);
    console.log('模拟考试配置:', course.mock_exam_config, typeof course.mock_exam_config);
    setSelectedCourse(course);
    setIsFormOpen(true);
  }

  const handleFormOpenChange = (open: boolean) => {
    setIsFormOpen(open)
    if (!open) {
      setSelectedCourse(undefined)
    }
  }

  const handleDeleteCourse = (course: Course) => {
    setCourseToDelete(course)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return

    try {
      const response = await coursesApi.deleteCourse(courseToDelete.id)
      if (response.code === 200) {
        toast({
          title: "课程已删除",
          description: `课程 "${courseToDelete.name}" 已被成功删除`,
        })
        fetchCourses()
      } else {
        toast({
          variant: "destructive",
          title: "删除课程失败",
          description: response.msg || response.message || "删除课程时出现错误",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "删除课程失败",
        description: "删除课程时出现错误",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setCourseToDelete(null)
    }
  }

  const handlePublishCourse = (course: Course) => {
    setCourseToUpdate({course, action: 'publish'})
    setIsStatusUpdateDialogOpen(true)
  }

  const handleArchiveCourse = (course: Course) => {
    setCourseToUpdate({course, action: 'archive'})
    setIsStatusUpdateDialogOpen(true)
  }

  const handleConfirmStatusUpdate = async () => {
    if (!courseToUpdate) return

    const { course, action } = courseToUpdate
    const newStatus = action === 'publish' ? 'active' : 'archived'
    
    try {
      const response = await coursesApi.updateCourse(course.id, {
        ...course,
        status: newStatus
      })
      
      if (response.code === 200) {
        toast({
          title: action === 'publish' ? "课程已发布" : "课程已归档",
          description: `课程 "${course.name}" 状态已更新`,
        })
        fetchCourses()
      } else {
        toast({
          variant: "destructive",
          title: "更新课程状态失败",
          description: response.msg || response.message || "更新课程状态时出现错误",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "更新课程状态失败",
        description: "更新课程状态时出现错误",
      })
    } finally {
      setIsStatusUpdateDialogOpen(false)
      setCourseToUpdate(null)
    }
  }

  // 处理查看课程详情
  const handleViewCourse = (course: Course) => {
    // 直接打开编辑表单
    setSelectedCourse(course);
    setIsFormOpen(true);
  };

  // 处理刷新按钮点击
  const handleRefresh = () => {
    // 重置筛选状态
    setSearchKeyword('');
    // 重置页码
    setCurrentPage(1);
    // 触发行选择重置
    if (resetSelectionRef.current) {
      resetSelectionRef.current();
    }
    // 刷新数据
    fetchCourses();
  };

  // 创建列定义，传入动作处理函数
  const columns = createColumns({
    onEdit: handleEditCourse,
    onDelete: handleDeleteCourse,
    onPublish: handlePublishCourse,
    onArchive: handleArchiveCourse,
    onViewDetails: handleViewCourse,
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
            <h2 className='text-2xl font-bold tracking-tight'>课程管理</h2>
            <p className='text-muted-foreground'>
              在这里管理您的所有课程
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleAddCourse}>
              <IconPlus className="mr-2 h-4 w-4" />
              新建课程
            </Button>
            <Button 
              variant="outline" 
              className="space-x-1" 
              onClick={handleRefresh}
            >
              <span>刷新</span> <IconRefresh size={18} />
            </Button>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {!isLoading && courseList && (
            <CoursesTable
              data={courseList.items}
              columns={columns}
              pageCount={Math.ceil(courseList.total / pageSize)}
              currentPage={currentPage}
              pageSize={pageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onPageChange={setCurrentPage}
              onPageSizeChange={handlePageSizeChange}
              onSearch={handleSearch}
              onResetSelection={(resetFn) => resetSelectionRef.current = resetFn}
              onViewDetails={handleViewCourse}
            />
          )}
        </div>
      </Main>

      {/* 课程表单对话框 */}
      <CourseForm 
        open={isFormOpen} 
        onOpenChange={handleFormOpenChange} 
        course={selectedCourse}
        onSuccess={fetchCourses}
      />

      {/* 删除确认对话框 */}
      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="确认删除课程"
        description={
          <>
            您确定要删除课程 <strong>"{courseToDelete?.name}"</strong> 吗？此操作不可逆。
          </>
        }
        onConfirm={handleConfirmDelete}
      />

      {/* 状态更新确认对话框 */}
      <AlertDialog open={isStatusUpdateDialogOpen} onOpenChange={setIsStatusUpdateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {courseToUpdate?.action === 'publish' ? '发布课程' : '归档课程'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              您确定要{courseToUpdate?.action === 'publish' ? '发布' : '归档'}课程 <strong>"{courseToUpdate?.course.name}"</strong> 吗？
              {courseToUpdate?.action === 'publish' 
                ? '发布后，学生将可以购买并访问此课程。' 
                : '归档后，此课程将不再对新学生开放购买。'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStatusUpdate}>
              确认{courseToUpdate?.action === 'publish' ? '发布' : '归档'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ScrollToTop zIndex={100} />
    </>
  )
} 