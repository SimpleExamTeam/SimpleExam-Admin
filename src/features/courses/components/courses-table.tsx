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
import { IconChevronDown, IconSearch, IconLayoutGrid, IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from '@tabler/icons-react'
import { Course } from '../data/schema'
import { Skeleton } from '@/components/ui/skeleton'
import { PageSizeOption } from '../index'

// 列名称映射表
const columnNameMap: Record<string, string> = {
  select: '选择',
  id: 'ID',
  cover: '封面',
  name: '课程',
  price: '价格',
  category_level1: '类别',
  category_level2: '二级分类',
  category_sort1: '二级分类排序',
  category_sort2: '课程排序',
  expire_days: '有效期(天)',
  sort: '类别排序',
  created_at: '创建时间',
  actions: '操作'
};

interface CoursesTableProps {
  data: Course[]
  columns: ColumnDef<Course>[]
  isLoading?: boolean
  pageCount?: number
  currentPage?: number
  pageSize: PageSizeOption
  pageSizeOptions: readonly number[]
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: PageSizeOption) => void
  onSearch?: (keyword: string) => void
  onResetSelection?: (resetFn: () => void) => void
  onViewDetails?: (course: Course) => void
}

export function CoursesTable({
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
  onResetSelection,
  onViewDetails,
}: CoursesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [searchKeyword, setSearchKeyword] = useState('')
  const [pageInputValue, setPageInputValue] = useState(currentPage.toString())
  
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

  // 处理页码输入框变化
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInputValue(e.target.value)
  }

  // 处理页码输入框按键事件（回车跳转）
  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePageJump()
    }
  }

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
    if (onPageSizeChange) {
      onPageSizeChange(size);
    }
  };

  return (
    <div className='w-full'>
      <div className='flex items-center py-4'>
        <div className="relative flex items-center max-w-sm">
          <Input
            placeholder='按课程名称、分类搜索...'
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
              <Button variant='outline' className='gap-1'>
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
                  {columns.map((_, colIndex) => (
                    <TableCell key={`skeleton-cell-${colIndex}`}>
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
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={(e) => {
                    // 当点击的是Checkbox或操作按钮时，不触发行点击事件
                    const target = e.target as HTMLElement;
                    if (
                      target.closest('input[type="checkbox"]') ||
                      target.closest('button') ||
                      target.closest('[role="menuitem"]')
                    ) {
                      return;
                    }
                    
                    // 直接调用传入的onViewDetails回调
                    if (onViewDetails && typeof onViewDetails === 'function') {
                      const course = row.original;
                      onViewDetails(course);
                    }
                  }}
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
          已选择 {table.getFilteredSelectedRowModel().rows.length} 个课程，共 {' '}
          {table.getFilteredRowModel().rows.length} 个课程
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