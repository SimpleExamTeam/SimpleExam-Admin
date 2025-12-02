import { useState, useEffect, useCallback } from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { IconChevronDown, IconSearch, IconLayoutGrid, IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconFilter, IconX } from '@tabler/icons-react'
import { Order } from '../data/schema'
import { Skeleton } from '@/components/ui/skeleton'
import { DateRange } from 'react-day-picker'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { format } from 'date-fns'
import { PageSizeOption } from '../index'
import { Badge } from '@/components/ui/badge'

// 列名称映射表
const columnNameMap: Record<string, string> = {
  select: '选择',
  id: 'ID',
  order_no: '订单号',
  amount: '金额',
  user: '用户',
  course_name: '课程名称',
  status: '状态',
  created_at: '创建时间',
  pay_time: '支付时间',
  payment_type: '支付方式',
  actions: '操作'
};

// 支付方式选项
const PAYMENT_TYPE_OPTIONS = [
  { value: "", label: "全部" },
  { value: "wechat", label: "微信支付" },
  { value: "alipay", label: "支付宝" },
  { value: "free", label: "免费" },
  { value: "card", label: "兑换卷" },
  { value: "other", label: "其他" },
];

// 订单状态选项
const STATUS_OPTIONS = [
  { value: "", label: "全部" },
  { value: "paid", label: "已支付" },
  { value: "unpaid", label: "未支付" },
  { value: "cancelled", label: "已取消" },
  { value: "refunded", label: "已退款" },
  { value: "refunding", label: "退款中" },
];

// 搜索参数接口
interface OrderSearchParams {
  order_no?: string;
  username?: string;
  user_id?: string;
  status?: string;
  payment_type?: string;
  start_time?: string;
  end_time?: string;
}

// 搜索模式类型
type SearchMode = 'orderNo' | 'username' | 'userId';

interface OrdersTableProps {
  data: Order[]
  columns: ColumnDef<Order>[]
  isLoading?: boolean
  pageCount?: number
  currentPage?: number
  pageSize: PageSizeOption
  pageSizeOptions: readonly number[]
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: PageSizeOption) => void
  onSearch?: (params: OrderSearchParams) => void
  onDateRangeChange?: (dateRange: { start_time?: string; end_time?: string }) => void
  onResetSelection?: (resetFn: () => void) => void
  onViewOrder?: (order: Order) => void
  statusFilter?: string
  paymentTypeFilter?: string
  className?: string
  onReset?: () => void
}

export function OrdersTable({
  data,
  columns,
  isLoading = false,
  pageCount = 0,
  currentPage = 1,
  pageSize = 10,
  pageSizeOptions = [10, 50, 100, 200],
  onPageChange,
  onPageSizeChange,
  onSearch,
  onDateRangeChange,
  onResetSelection,
  onViewOrder,
  statusFilter = "",
  paymentTypeFilter = "",
  className,
  onReset,
}: OrdersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [orderNoKeyword, setOrderNoKeyword] = useState('')
  const [usernameKeyword, setUsernameKeyword] = useState('')
  const [userIdKeyword, setUserIdKeyword] = useState('')
  const [status, setStatus] = useState(statusFilter)
  const [paymentType, setPaymentType] = useState(paymentTypeFilter)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [pageInputValue, setPageInputValue] = useState(currentPage.toString())
  const [searchMode, setSearchMode] = useState<SearchMode>('username') // 默认使用用户名搜索

  // 当currentPage变化时更新输入框值
  useEffect(() => {
    setPageInputValue(currentPage.toString())
  }, [currentPage])
  
  // 重置行选择的函数
  const resetSelection = useCallback(() => {
    if (Object.keys(rowSelection).length > 0) {
      setRowSelection({});
    }
  }, [rowSelection]);
  
  // 注册重置函数
  useEffect(() => {
    if (onResetSelection) {
      onResetSelection(resetSelection);
    }
  }, [onResetSelection, resetSelection]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: pageSize,
      },
    },
    manualPagination: true,
    pageCount,
  })

  // 处理搜索模式切换
  const handleSearchModeChange = (mode: SearchMode) => {
    // 切换搜索模式时清空所有搜索框内容
    setOrderNoKeyword('');
    setUsernameKeyword('');
    setUserIdKeyword('');
    setSearchMode(mode);
    console.log('搜索模式切换为:', mode);
  };

  // 处理搜索按钮点击
  const handleSearch = () => {
    if (onSearch) {
      const params: OrderSearchParams = {};
      
      // 只有当状态有值时才添加
      if (status) {
        params.status = status;
      }
      
      // 只有当支付方式有值时才添加
      if (paymentType) {
        params.payment_type = paymentType;
      }
      
      // 根据搜索模式添加对应的搜索参数
      if (searchMode === 'orderNo' && orderNoKeyword.trim()) {
        params.order_no = orderNoKeyword.trim();
      } else if (searchMode === 'username' && usernameKeyword.trim()) {
        params.username = usernameKeyword.trim();
      } else if (searchMode === 'userId' && userIdKeyword.trim()) {
        params.user_id = userIdKeyword.trim();
        console.log('设置用户ID搜索参数:', userIdKeyword.trim());
      }
      
      // 只有当日期范围有值时才添加
      if (dateRange?.from) {
        params.start_time = format(dateRange.from, 'yyyy-MM-dd 00:00:00');
        if (dateRange.to) {
          params.end_time = format(dateRange.to, 'yyyy-MM-dd 23:59:59');
        }
      }
      
      console.log('搜索参数:', params);
      onSearch(params);
    }
  };

  // 处理按回车键搜索
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 处理日期范围变化
  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
    
    if (onDateRangeChange && newDateRange?.from) {
      const startTime = format(newDateRange.from, 'yyyy-MM-dd 00:00:00');
      const endTime = newDateRange.to ? format(newDateRange.to, 'yyyy-MM-dd 23:59:59') : undefined;
      
      onDateRangeChange({
        start_time: startTime,
        end_time: endTime,
      });
    } else if (onDateRangeChange) {
      // 清除日期筛选
      onDateRangeChange({});
    }
  };

  // 处理状态筛选变化
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    
    // 使用最新状态直接构建参数对象
    if (onSearch) {
      const params: OrderSearchParams = {};
      
      // 只有当状态有值时才添加
      if (newStatus) {
        params.status = newStatus;
      }
      
      // 只有当支付方式有值时才添加
      if (paymentType) {
        params.payment_type = paymentType;
      }
      
      // 根据搜索模式添加对应的搜索参数
      if (searchMode === 'orderNo' && orderNoKeyword.trim()) {
        params.order_no = orderNoKeyword.trim();
      } else if (searchMode === 'username' && usernameKeyword.trim()) {
        params.username = usernameKeyword.trim();
      } else if (searchMode === 'userId' && userIdKeyword.trim()) {
        params.user_id = userIdKeyword.trim();
      }
      
      // 只有当日期范围有值时才添加
      if (dateRange?.from) {
        params.start_time = format(dateRange.from, 'yyyy-MM-dd 00:00:00');
        if (dateRange.to) {
          params.end_time = format(dateRange.to, 'yyyy-MM-dd 23:59:59');
        }
      }
      
      onSearch(params);
    }
  };

  // 处理支付方式筛选变化
  const handlePaymentTypeChange = (newPaymentType: string) => {
    setPaymentType(newPaymentType);
    
    // 使用最新支付方式直接构建参数对象
    if (onSearch) {
      const params: OrderSearchParams = {};
      
      // 只有当状态有值时才添加
      if (status) {
        params.status = status;
      }
      
      // 只有当支付方式有值时才添加
      if (newPaymentType) {
        params.payment_type = newPaymentType;
      }
      
      // 根据搜索模式添加对应的搜索参数
      if (searchMode === 'orderNo' && orderNoKeyword.trim()) {
        params.order_no = orderNoKeyword.trim();
      } else if (searchMode === 'username' && usernameKeyword.trim()) {
        params.username = usernameKeyword.trim();
      } else if (searchMode === 'userId' && userIdKeyword.trim()) {
        params.user_id = userIdKeyword.trim();
      }
      
      // 只有当日期范围有值时才添加
      if (dateRange?.from) {
        params.start_time = format(dateRange.from, 'yyyy-MM-dd 00:00:00');
        if (dateRange.to) {
          params.end_time = format(dateRange.to, 'yyyy-MM-dd 23:59:59');
        }
      }
      
      onSearch(params);
    }
  };

  // 获取当前搜索模式的关键词
  const getCurrentKeyword = () => {
    switch (searchMode) {
      case 'orderNo':
        return orderNoKeyword;
      case 'username':
        return usernameKeyword;
      case 'userId':
        return userIdKeyword;
      default:
        return '';
    }
  };

  // 设置当前搜索模式的关键词
  const setCurrentKeyword = (value: string) => {
    switch (searchMode) {
      case 'orderNo':
        setOrderNoKeyword(value);
        break;
      case 'username':
        setUsernameKeyword(value);
        break;
      case 'userId':
        setUserIdKeyword(value);
        break;
    }
  };

  // 获取当前搜索模式的占位符
  const getPlaceholder = () => {
    switch (searchMode) {
      case 'orderNo':
        return '输入订单号搜索...';
      case 'username':
        return '输入用户名搜索...';
      case 'userId':
        return '输入用户ID搜索...';
      default:
        return '搜索...';
    }
  };

  // 获取当前搜索模式的显示文本
  const getSearchModeText = () => {
    switch (searchMode) {
      case 'orderNo':
        return '订单号';
      case 'username':
        return '用户名';
      case 'userId':
        return '用户ID';
      default:
        return '搜索';
    }
  };

  // 处理页面大小变化
  const handlePageSizeChange = (size: PageSizeOption) => {
    if (onPageSizeChange) {
      onPageSizeChange(size);
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInputValue(e.target.value)
  }

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePageJump()
    }
  }

  const handlePageJump = () => {
    const pageNumber = parseInt(pageInputValue)
    if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > pageCount) {
      setPageInputValue(currentPage.toString())
      return
    }
    if (onPageChange) {
      onPageChange(pageNumber)
    }
  }
  
  // 处理行点击事件
  const handleRowClick = (event: React.MouseEvent, row: Order) => {
    // 如果是点击在操作按钮区域上，不触发行点击事件
    if ((event.target as HTMLElement).closest('[data-prevent-row-click="true"]')) {
      return;
    }
    
    // 如果是点击在复选框上，不触发行点击事件
    if ((event.target as HTMLElement).closest('.checkbox-cell')) {
      return;
    }
    
    if (onViewOrder) {
      onViewOrder(row);
    }
  };

  // 重置所有筛选条件
  const handleReset = () => {
    // 重置所有本地状态
    setOrderNoKeyword('');
    setUsernameKeyword('');
    setUserIdKeyword('');
    setStatus('');
    setPaymentType('');
    setDateRange(undefined);
    setSearchMode('username'); // 重置为默认搜索模式
    
    // 调用父组件的重置函数
    if (onReset) {
      onReset();
    }
  };

  // 表格加载状态的骨架屏组件
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-8 w-[150px]" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {Array(6).fill(0).map((_, index) => (
                <TableCell key={index} className="py-3">
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableHeader>
            <TableBody>
              {Array(5).fill(0).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array(6).fill(0).map((_, cellIndex) => (
                    <TableCell key={cellIndex} className="py-3">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2">
          <Skeleton className="h-8 w-[100px]" />
          <Skeleton className="h-8 w-[70px]" />
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full ${className || ''}`}>
      <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4'>
        <div className="relative flex items-center max-w-sm">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2 border-r-0 rounded-r-none">
                {getSearchModeText()}
                <IconChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleSearchModeChange('orderNo')}>
                订单号
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSearchModeChange('username')}>
                用户名
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSearchModeChange('userId')}>
                用户ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Input
            placeholder={getPlaceholder()}
            value={getCurrentKeyword()}
            onChange={(e) => setCurrentKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            className='rounded-l-none pr-10'
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 h-8 w-8"
            onClick={handleSearch}
          >
            <IconSearch size={18} />
            <span className="sr-only">搜索</span>
          </Button>
        </div>
        
        <div className="w-full sm:w-auto sm:min-w-[300px]">
          <DateRangePicker 
            dateRange={dateRange} 
            onDateRangeChange={handleDateRangeChange} 
            placeholder="按日期筛选" 
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="gap-1"
              size="sm"
            >
              <IconFilter size={16} />
              订单状态
              {status && (
                <Badge variant="secondary" className="ml-1">
                  {STATUS_OPTIONS.find(opt => opt.value === status)?.label || status}
                </Badge>
              )}
              <IconChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {STATUS_OPTIONS.map((option) => (
              <DropdownMenuItem 
                key={option.value} 
                onClick={() => handleStatusChange(option.value)}
                className={status === option.value ? "bg-accent" : ""}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="gap-1"
              size="sm"
            >
              <IconFilter size={16} />
              支付方式
              {paymentType && (
                <Badge variant="secondary" className="ml-1">
                  {PAYMENT_TYPE_OPTIONS.find(opt => opt.value === paymentType)?.label || paymentType}
                </Badge>
              )}
              <IconChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {PAYMENT_TYPE_OPTIONS.map((option) => (
              <DropdownMenuItem 
                key={option.value} 
                onClick={() => handlePaymentTypeChange(option.value)}
                className={paymentType === option.value ? "bg-accent" : ""}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={handleReset}
        >
          <IconX size={16} />
          重置筛选
        </Button>
        
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size="sm" className="h-8 gap-1">
                <IconLayoutGrid className="h-4 w-4" />
                {pageSize} 条/页
                <IconChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {pageSizeOptions.map((size) => (
                <DropdownMenuItem 
                  key={size}
                  onClick={() => handlePageSizeChange(size as PageSizeOption)}
                  className={pageSize === size ? "bg-accent" : ""}
                >
                  {size} 条/页
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size="sm" className="h-8 gap-1">
                显示列 <IconChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className='capitalize'
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {columnNameMap[column.id] || column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={(event) => handleRowClick(event, row.original)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id}
                      className={cell.column.id === 'select' ? 'checkbox-cell' : ''}
                    >
                      {cell.column.id === 'actions' ? (
                        <div data-prevent-row-click="true">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      ) : (
                        flexRender(cell.column.columnDef.cell, cell.getContext())
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* 分页控制 */}
      <div className="flex items-center justify-between space-x-6 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <span>
              已选择 {table.getFilteredSelectedRowModel().rows.length} 条，共{' '}
              {table.getFilteredRowModel().rows.length} 条
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2 flex-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(1)}
            disabled={currentPage === 1}
            title="首页"
          >
            <IconChevronsLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <IconChevronLeft className="h-4 w-4 mr-1" />
            上一页
          </Button>
          
          <div className="flex items-center space-x-1">
            <div className="text-sm">
              <Input
                className="h-8 w-12 text-center px-1"
                value={pageInputValue}
                onChange={handlePageInputChange}
                onKeyDown={handlePageInputKeyDown}
                onBlur={handlePageJump}
              />
            </div>
            <span className="text-sm font-medium">/ {pageCount} 页</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage === pageCount}
          >
            下一页
            <IconChevronRight className="h-4 w-4 ml-1" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(pageCount)}
            disabled={currentPage === pageCount}
            title="尾页"
          >
            <IconChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}