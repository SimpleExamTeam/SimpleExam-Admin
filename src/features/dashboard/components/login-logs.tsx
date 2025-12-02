import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react'
import { systemApi } from '@/lib/api'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { IconCheck, IconX, IconDeviceDesktop, IconSearch, IconNetwork, IconCalendar } from '@tabler/icons-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// 登录日志类型定义
interface LoginLog {
  id: number
  username: string
  ip: string
  user_agent: string
  is_success: boolean
  login_time: string
  fail_reason: string
}

// 登录状态选项
const STATUS_OPTIONS = [
  { value: "all", label: '全部状态' },
  { value: "success", label: '登录成功' },
  { value: "fail", label: '登录失败' },
]

// 日期范围选项
const DATE_RANGE_OPTIONS = [
  { value: "today", label: '今天' },
  { value: "7days", label: '最近7天' },
  { value: "30days", label: '最近30天' },
  { value: "all", label: '全部时间' },
]

// 每页显示数量
const PAGE_SIZE = 5

// 组件属性定义
interface LoginLogsProps {
  // 可以添加属性以便将来扩展
  autoLoad?: boolean;
}

// 导出组件引用类型
export interface LoginLogsRef {
  refreshData: () => void;
}

export const LoginLogs = forwardRef<LoginLogsRef, LoginLogsProps>(({ autoLoad = false }, ref) => {
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [status, setStatus] = useState("all")
  const [dateRange, setDateRange] = useState("today")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  
  // 使用ref跟踪请求状态和用户操作
  const requestInProgress = useRef(false);
  const isUserAction = useRef(false);
  const isInitialized = useRef(false);

  // 格式化日期为API要求的格式
  const formatDateForApi = (date: Date) => {
    return format(date, 'yyyy-MM-dd HH:mm:ss')
  }

  // 获取登录日志
  const fetchLoginLogs = async (params = {}) => {
    // 防止重复请求
    if (requestInProgress.current) {
      return;
    }
    
    // 如果不是用户操作且不是自动加载，则跳过初始请求
    if (!isUserAction.current && !autoLoad && !isInitialized.current) {
      isInitialized.current = true;
      return;
    }
    
    try {
      requestInProgress.current = true;
      setIsLoading(true);
      
      const response = await systemApi.getLoginLogs({ 
        page: currentPage, 
        size: PAGE_SIZE,
        ...params
      })
      
      if (response.code === 200 && response.data?.items) {
        setLoginLogs(response.data.items)
        setTotal(response.data.total || 0)
        setTotalPages(Math.ceil((response.data.total || 0) / PAGE_SIZE))
      } else {
        setLoginLogs([])
        setTotal(0)
        setTotalPages(1)
      }
    } catch (error) {
      console.error('获取登录日志失败:', error)
      setLoginLogs([])
      setTotal(0)
      setTotalPages(1)
    } finally {
      setIsLoading(false)
      requestInProgress.current = false;
      isUserAction.current = false;
    }
  }

  // 暴露刷新方法给父组件
  useImperativeHandle(ref, () => ({
    refreshData: () => {
      isUserAction.current = true; // 标记为用户操作，确保会发起请求
      handleSearch();
    }
  }));

  // 初始加载 - 使用autoLoad控制是否自动请求
  useEffect(() => {
    if (autoLoad) {
      fetchLoginLogs();
    } else {
      isInitialized.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 页码变化时重新加载 - 标记为用户操作
  useEffect(() => {
    // 跳过组件首次渲染
    if (!isInitialized.current) {
      return;
    }
    
    isUserAction.current = true;
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  // 处理搜索 - 用户手动操作
  const handleSearch = () => {
    isUserAction.current = true;
    
    const params: { username?: string; status?: string } = {}
    if (username.trim()) {
      params.username = username.trim()
    }
    if (status && status !== "all") {
      params.status = status
    }
    
    // 添加日期范围参数
    let dateParams = {}
    if (dateRange === 'today') {
      const today = new Date()
      dateParams = {
        start_time: formatDateForApi(startOfDay(today)),
        end_time: formatDateForApi(endOfDay(today))
      }
    } else if (dateRange === '7days') {
      dateParams = {
        start_time: formatDateForApi(startOfDay(subDays(new Date(), 6))),
        end_time: formatDateForApi(endOfDay(new Date()))
      }
    } else if (dateRange === '30days') {
      dateParams = {
        start_time: formatDateForApi(startOfDay(subDays(new Date(), 29))),
        end_time: formatDateForApi(endOfDay(new Date()))
      }
    }
    
    fetchLoginLogs({
      ...params,
      ...dateParams
    })
  }

  // 处理状态变更 - 用户手动操作
  const handleStatusChange = (value: string) => {
    isUserAction.current = true;
    setStatus(value)
    setCurrentPage(1) // 重置页码
    
    // 同样更新处理状态变更的方法，保持一致性
    const params: { username?: string; status?: string } = {}
    if (username.trim()) {
      params.username = username.trim()
    }
    if (value && value !== "all") {
      params.status = value
    }
    
    // 添加日期范围参数
    let dateParams = {}
    if (dateRange === 'today') {
      const today = new Date()
      dateParams = {
        start_time: formatDateForApi(startOfDay(today)),
        end_time: formatDateForApi(endOfDay(today))
      }
    } else if (dateRange === '7days') {
      dateParams = {
        start_time: formatDateForApi(startOfDay(subDays(new Date(), 6))),
        end_time: formatDateForApi(endOfDay(new Date()))
      }
    } else if (dateRange === '30days') {
      dateParams = {
        start_time: formatDateForApi(startOfDay(subDays(new Date(), 29))),
        end_time: formatDateForApi(endOfDay(new Date()))
      }
    }
    
    fetchLoginLogs({
      ...params,
      ...dateParams
    })
  }

  // 处理日期范围变更 - 用户手动操作
  const handleDateRangeChange = (value: string) => {
    isUserAction.current = true;
    setDateRange(value)
    setCurrentPage(1) // 重置页码
    
    // 这里立即构建新的参数对象，使用新的value而不是状态中的dateRange
    const params: { username?: string; status?: string } = {}
    if (username.trim()) {
      params.username = username.trim()
    }
    if (status && status !== "all") {
      params.status = status
    }
    
    // 添加日期范围参数
    let dateParams = {}
    if (value === 'today') {
      const today = new Date()
      dateParams = {
        start_time: formatDateForApi(startOfDay(today)),
        end_time: formatDateForApi(endOfDay(today))
      }
    } else if (value === '7days') {
      dateParams = {
        start_time: formatDateForApi(startOfDay(subDays(new Date(), 6))),
        end_time: formatDateForApi(endOfDay(new Date()))
      }
    } else if (value === '30days') {
      dateParams = {
        start_time: formatDateForApi(startOfDay(subDays(new Date(), 29))),
        end_time: formatDateForApi(endOfDay(new Date()))
      }
    }
    
    // 使用最新的参数立即发送请求
    fetchLoginLogs({
      ...params,
      ...dateParams
    })
  }

  // 处理页码变更 - 用户手动操作
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    isUserAction.current = true;
    setCurrentPage(page)
  }

  // 清除筛选 - 用户手动操作
  const handleClearFilters = () => {
    isUserAction.current = true;
    setUsername('')
    setStatus("all")
    setDateRange("today")
    setCurrentPage(1)
    
    // 添加今天的日期范围参数
    const today = new Date()
    const dateParams = {
      start_time: formatDateForApi(startOfDay(today)),
      end_time: formatDateForApi(endOfDay(today))
    }
    
    // 使用今天的日期范围请求数据
    fetchLoginLogs(dateParams)
  }

  // 获取浏览器和设备信息
  const getDeviceInfo = (userAgent: string) => {
    let browser = '未知浏览器'
    let version = ''
    let device = '未知设备'
    
    // 检测浏览器
    if (userAgent.includes('Chrome')) {
      browser = 'Chrome'
      const match = userAgent.match(/Chrome\/(\d+\.\d+)/)
      if (match) version = match[1]
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox'
      const match = userAgent.match(/Firefox\/(\d+\.\d+)/)
      if (match) version = match[1]
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browser = 'Safari'
      const match = userAgent.match(/Version\/(\d+\.\d+)/)
      if (match) version = match[1]
    } else if (userAgent.includes('Edge')) {
      browser = 'Edge'
      const match = userAgent.match(/Edge\/(\d+\.\d+)/)
      if (match) version = match[1]
    } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
      browser = 'IE'
      const match = userAgent.match(/MSIE (\d+\.\d+)/) || userAgent.match(/rv:(\d+\.\d+)/)
      if (match) version = match[1]
    }
    
    // 检测设备
    if (userAgent.includes('Windows')) {
      device = 'Windows'
    } else if (userAgent.includes('Macintosh')) {
      device = 'Mac'
    } else if (userAgent.includes('iPhone')) {
      device = 'iPhone'
    } else if (userAgent.includes('iPad')) {
      device = 'iPad'
    } else if (userAgent.includes('Android')) {
      device = 'Android'
    } else if (userAgent.includes('Linux')) {
      device = 'Linux'
    }
    
    return {
      browser,
      version: version ? ` ${version}` : '',
      device
    }
  }

  // 格式化日期时间
  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr)
      return format(date, 'yyyy-MM-dd HH:mm:ss')
    } catch (error) {
      return dateTimeStr
    }
  }

  // 筛选区域
  const renderFilters = () => (
    <div className="mb-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="输入用户名搜索"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full h-8"
          />
        </div>
        <div className="w-full sm:w-32">
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="选择状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-32">
          <Select value={dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="选择日期范围" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {DATE_RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <Button variant="outline" size="sm" onClick={handleClearFilters} className="h-8">
            重置
          </Button>
          <Button size="sm" onClick={handleSearch} className="h-8">
            <IconSearch className="h-4 w-4 mr-1" />
            搜索
          </Button>
        </div>
      </div>
    </div>
  )

  // 分页区域
  const renderPagination = () => {
    if (totalPages <= 1) return null
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => handlePageChange(currentPage - 1)} 
              className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
            />
          </PaginationItem>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum
            
            if (totalPages <= 5) {
              // 总页数少于5，直接显示所有页码
              pageNum = i + 1
            } else if (currentPage <= 3) {
              // 当前页在前3页，显示1-5页
              pageNum = i + 1
            } else if (currentPage >= totalPages - 2) {
              // 当前页在后3页，显示最后5页
              pageNum = totalPages - 4 + i
            } else {
              // 当前页在中间，显示当前页及其前后2页
              pageNum = currentPage - 2 + i
            }
            
            return (
              <PaginationItem key={i}>
                <PaginationLink 
                  isActive={currentPage === pageNum} 
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            )
          })}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => handlePageChange(currentPage + 1)} 
              className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  // 渲染底部分页和统计信息
  const renderFooter = () => (
    <div className="sticky bottom-0 pt-2 pb-2 bg-background border-t">
      {renderPagination()}
      
      {total > 0 && (
        <div className='text-xs text-muted-foreground text-center mt-2'>
          共 {total} 条记录，当前显示第 {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, total)} 条
        </div>
      )}
    </div>
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        {renderFilters()}
        <div className='space-y-6'>
          {Array(5).fill(0).map((_, index) => (
            <div key={index} className='flex items-center gap-4'>
              <div className="h-9 w-9">
                <Skeleton className='h-full w-full rounded-full' />
              </div>
              <div className='space-y-2 flex-1'>
                <Skeleton className='h-4 w-[200px]' />
                <Skeleton className='h-3 w-[150px]' />
              </div>
            </div>
          ))}
        </div>
        {renderFooter()}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {renderFilters()}
      <div className='space-y-6 pb-2 min-h-[200px]'>
        {loginLogs.map((log) => {
          const deviceInfo = getDeviceInfo(log.user_agent)
          return (
            <div key={log.id} className='flex items-center gap-4'>
              <div className={cn(
                'h-9 w-9 rounded-full flex items-center justify-center',
                log.is_success ? 'bg-green-100' : 'bg-red-100'
              )}>
                {log.is_success ? (
                  <IconCheck className='h-5 w-5 text-green-600' />
                ) : (
                  <IconX className='h-5 w-5 text-red-600' />
                )}
              </div>
              <div className='flex flex-1 flex-col md:flex-row md:items-center md:justify-between'>
                <div className='space-y-1'>
                  <div className='flex items-center'>
                    <span className='text-sm font-medium'>{log.username}</span>
                    <Badge className="ml-2 px-2 py-0" variant={log.is_success ? "success" : "destructive"}>
                      {log.is_success ? '成功' : '失败'}
                    </Badge>
                  </div>
                  <div className='flex items-center text-muted-foreground text-xs'>
                    <span className='inline-flex items-center'>
                      <IconNetwork className='h-3 w-3 mr-1' />
                      <span className='inline-block'>{log.ip}</span>
                    </span>
                    <span className='mx-1'>•</span>
                    <span className='inline-flex items-center'>
                      <IconDeviceDesktop className='h-3 w-3 mr-1' />
                      {deviceInfo.browser}{deviceInfo.version} / {deviceInfo.device}
                    </span>
                  </div>
                </div>
                <div className='text-xs text-right mt-1 md:mt-0'>
                  <div className='text-muted-foreground flex items-center justify-end'>
                    <IconCalendar className='h-3 w-3 mr-1' />
                    {formatDateTime(log.login_time)}
                  </div>
                  {!log.is_success && log.fail_reason && (
                    <div className='text-red-500 text-xs mt-1'>{log.fail_reason}</div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {loginLogs.length === 0 && !isLoading && (
          <div className='text-center py-4 text-muted-foreground'>
            暂无登录日志记录
          </div>
        )}
      </div>
      
      {renderFooter()}
    </div>
  )
}) 