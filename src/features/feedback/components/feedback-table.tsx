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
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import { 
  IconChevronDown, 
  IconSearch, 
  IconLayoutGrid, 
  IconChevronLeft, 
  IconChevronRight, 
  IconChevronsLeft, 
  IconChevronsRight,
  IconFilter
} from '@tabler/icons-react'
import { Feedback } from '../data/schema'
import { Skeleton } from '@/components/ui/skeleton'
import { PageSizeOption } from '../context/feedback-context'
import { DateRange } from 'react-day-picker'
import { DateRangePicker } from '@/components/ui/date-range-picker'

// 列名称映射表
const columnNameMap: Record<string, string> = {
  select: '选择',
  id: 'ID',
  user: '用户信息',
  feedback_content: '反馈内容',
  reply_content: '回复内容',
  status: '状态',
  created_at: '提交时间',
  actions: '操作'
};

interface FeedbackTableProps {
  data: Feedback[]
  columns: ColumnDef<Feedback>[]
  isLoading?: boolean
  pageCount?: number
  currentPage?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: PageSizeOption) => void
  onSearch?: (keyword: string) => void
  onStatusChange?: (status: number | undefined) => void
  onDateRangeChange?: (dateRange: DateRange | undefined) => void
  onResetSelection?: (resetFn: () => void) => void
  onViewFeedback?: (feedback: Feedback) => void
  dateRange?: DateRange
  statusFilter?: number
}

export function FeedbackTable({
  data,
  columns,
  isLoading = false,
  pageCount = 0,
  currentPage = 1,
  onPageChange,
  onPageSizeChange,
  onSearch,
  onStatusChange,
  onDateRangeChange,
  onResetSelection,
  onViewFeedback,
  dateRange,
  statusFilter
}: FeedbackTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [searchKeyword, setSearchKeyword] = useState('')
  const [currentPageSize, setCurrentPageSize] = useState<PageSizeOption>(10)
  const [pageInputValue, setPageInputValue] = useState(currentPage.toString())

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
        pageSize: currentPageSize,
      },
    },
    manualPagination: true,
    pageCount,
  })

  // 处理搜索按钮点击
  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchKeyword);
    }
  };

  // 处理按回车键搜索
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(searchKeyword);
    }
  };

  // 处理页面大小变化
  const handlePageSizeChange = (size: PageSizeOption) => {
    setCurrentPageSize(size);
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

  // 当currentPage变化时更新输入框值
  useEffect(() => {
    setPageInputValue(currentPage.toString())
  }, [currentPage])

  // 重置行选择状态
  const resetSelection = useCallback(() => {
    if (Object.keys(rowSelection).length > 0) {
      setRowSelection({});
    }
  }, [rowSelection]);

  // 注册重置函数到父组件
  useEffect(() => {
    if (onResetSelection) {
      onResetSelection(resetSelection);
    }
  }, [onResetSelection, resetSelection]);

  // 处理页码跳转
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

  // 处理状态筛选变化
  const handleStatusChange = (status: number | undefined) => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  };

  return (
    <div className='w-full'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4'>
        <div className="relative flex items-center max-w-sm">
          <Input
            placeholder='按用户名或昵称搜索...'
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            className='pr-10'
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

        <div className="w-full sm:w-auto">
          <DateRangePicker 
            dateRange={dateRange} 
            onDateRangeChange={onDateRangeChange} 
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
              状态
              {statusFilter !== undefined && (
                <Badge variant="secondary" className="ml-1">
                  {statusFilter === 0 ? '未确认' : '已确认'}
                </Badge>
              )}
              <IconChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleStatusChange(undefined)}>
              全部
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange(0)}>
              未确认
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange(1)}>
              已确认
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size="sm" className="h-8 gap-1">
                <IconLayoutGrid className="h-4 w-4" />
                {currentPageSize} 条/页
                <IconChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {[10, 50, 100, 200].map((size) => (
                <DropdownMenuItem 
                  key={size}
                  onClick={() => handlePageSizeChange(size as PageSizeOption)}
                  className={currentPageSize === size ? "bg-accent" : ""}
                >
                  {size} 条/页
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='gap-1' size="sm">
                列显示 <IconChevronDown className='h-4 w-4' />
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
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {Array.from({ length: columns.length }).map((_, cellIndex) => (
                    <TableCell key={`skeleton-cell-${index}-${cellIndex}`}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={(e) => {
                    // 如果点击的是TableCell或其子元素，才触发查看操作
                    if (e.target instanceof HTMLElement && 
                        (e.target.tagName === 'TD' || 
                         e.target.closest('td') && !e.target.closest('button'))) {
                      // 阻止事件冒泡
                      e.stopPropagation();
                      if (onViewFeedback) {
                        onViewFeedback(row.original);
                      }
                    }
                  }}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
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
                  没有结果
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-end space-x-2 py-4'>
        <div className="flex-1 text-sm text-muted-foreground">
          已选择 {table.getFilteredSelectedRowModel().rows.length} 条反馈，共 {' '}
          {table.getFilteredRowModel().rows.length} 条反馈
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