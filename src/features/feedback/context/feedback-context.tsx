import React, { useState, useRef } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { Feedback, FeedbackList, feedbackListSchema } from '../data/schema'
import { feedbackApi, useDeduplicatedEffect } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { DateRange } from 'react-day-picker'
import { format } from 'date-fns'

type FeedbackDialogType = 'view' | 'reply' | 'delete'

// 可选的每页数据条数
export const PAGE_SIZE_OPTIONS = [10, 50, 100, 200] as const;
export type PageSizeOption = typeof PAGE_SIZE_OPTIONS[number];

interface FeedbackContextType {
  open: FeedbackDialogType | null
  setOpen: (str: FeedbackDialogType | null) => void
  currentFeedback: Feedback | null
  setCurrentFeedback: React.Dispatch<React.SetStateAction<Feedback | null>>
  fetchFeedbacks: () => Promise<void>
  feedbackList: FeedbackList | null
  isLoading: boolean
  currentPage: number
  pageSize: PageSizeOption
  handlePageChange: (page: number) => void
  handlePageSizeChange: (size: PageSizeOption) => void
  handleSearch: (value: string) => void
  handleRefresh: () => Promise<void>
  pageSizeOptions: readonly number[]
  resetSelectionRef: React.MutableRefObject<(() => void) | null>
  statusFilter: number | undefined
  setStatusFilter: React.Dispatch<React.SetStateAction<number | undefined>>
  dateRange: DateRange | undefined
  setDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>
  handleDateRangeChange: (range: DateRange | undefined) => void
  handleStatusChange: (status: number | undefined) => void
}

const FeedbackContext = React.createContext<FeedbackContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function FeedbackProvider({ children }: Props) {
  const [open, setOpenState] = useDialogState<FeedbackDialogType>(null)
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null)
  const [feedbackList, setFeedbackList] = useState<FeedbackList | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSizeOption>(10)
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const { toast } = useToast()
  const resetSelectionRef = useRef<(() => void) | null>(null)
  
  // 自定义 setOpen 函数，处理对话框状态变化
  const setOpen = (dialogType: FeedbackDialogType | null) => {
    // 当对话框关闭或类型变化时，清除临时状态
    if (dialogType === null) {
      // 如果关闭对话框，可以考虑是否需要重置 currentFeedback
      // setCurrentFeedback(null); // 取消注释如果需要完全重置
    }
    
    // 更新对话框状态
    setOpenState(dialogType);
  };

  // 获取反馈列表的方法
  const fetchFeedbacks = async () => {
    setIsLoading(true)
    try {
      // 准备日期范围参数
      let startTime, endTime;
      if (dateRange?.from) {
        startTime = format(dateRange.from, 'yyyy-MM-dd 00:00:00');
        if (dateRange.to) {
          endTime = format(dateRange.to, 'yyyy-MM-dd 23:59:59');
        }
      }

      const response = await feedbackApi.getFeedbacks({
        page: currentPage,
        size: pageSize,
        username: searchKeyword || undefined,
        status: statusFilter,
        start_time: startTime,
        end_time: endTime,
      }) as any
      
      if (response.code === 200) {
        // 确保即使API返回null也能正确处理
        const adaptedData = {
          items: response.data?.items || [],
          total: response.data?.total || 0
        }
        
        const parsedData = feedbackListSchema.parse(adaptedData)
        setFeedbackList(parsedData)
      } else {
        toast({
          variant: "destructive",
          title: "获取反馈失败",
          description: response.msg || response.message || "加载反馈列表时出现错误",
        })
      }
    } catch (error) {
      console.error('获取反馈错误:', error)
      toast({
        variant: "destructive",
        title: "获取反馈失败",
        description: "加载反馈列表时出现错误",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 使用去重效果钩子替换原有的useEffect
  useDeduplicatedEffect(() => {
    fetchFeedbacks()
  }, [currentPage, pageSize, searchKeyword, statusFilter, dateRange], { dedupTime: 300 })

  // 设置搜索关键词
  const handleSearch = (value: string) => {
    setSearchKeyword(value)
    setCurrentPage(1) // 搜索时重置到第一页
  }

  // 处理页码变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 处理每页条数变化
  const handlePageSizeChange = (size: PageSizeOption) => {
    setPageSize(size);
    setCurrentPage(1); // 改变每页条数时重置到第一页
  };

  // 处理状态筛选变化
  const handleStatusChange = (status: number | undefined) => {
    setStatusFilter(status);
    setCurrentPage(1); // 筛选时重置到第一页
  };

  // 处理日期范围变化
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setCurrentPage(1); // 日期筛选时重置到第一页
  };

  // 处理刷新按钮点击
  const handleRefresh = async () => {
    // 重置筛选状态
    setSearchKeyword('');
    setStatusFilter(undefined);
    setDateRange(undefined);
    // 重置页码
    setCurrentPage(1);
    // 触发行选择重置
    if (resetSelectionRef.current) {
      resetSelectionRef.current();
    }
    // 刷新数据
    await fetchFeedbacks();
  };

  return (
    <FeedbackContext.Provider value={{ 
      open, 
      setOpen, 
      currentFeedback, 
      setCurrentFeedback, 
      fetchFeedbacks,
      feedbackList,
      isLoading,
      currentPage,
      pageSize,
      handlePageChange,
      handlePageSizeChange,
      handleSearch,
      handleRefresh,
      pageSizeOptions: PAGE_SIZE_OPTIONS,
      resetSelectionRef,
      statusFilter,
      setStatusFilter,
      dateRange,
      setDateRange,
      handleDateRangeChange,
      handleStatusChange
    }}>
      {children}
    </FeedbackContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFeedback = () => {
  const feedbackContext = React.useContext(FeedbackContext)

  if (!feedbackContext) {
    throw new Error('useFeedback has to be used within <FeedbackContext>')
  }

  return feedbackContext
} 