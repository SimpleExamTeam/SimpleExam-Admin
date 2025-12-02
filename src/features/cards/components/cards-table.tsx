import { useState, useEffect, useMemo, memo, useCallback } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  IconChevronLeft, 
  IconChevronRight, 
  IconChevronsLeft,
  IconChevronsRight,
  IconSearch,
  IconChevronDown,
  IconLayoutGrid
} from '@tabler/icons-react'
import { Card } from '../data/schema'
import { PAGE_SIZE_OPTIONS, type PageSizeOption } from '../index'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'

// 列名称映射表
const columnNameMap: Record<string, string> = {
  select: '选择',
  id: 'ID',
  card_no: '卡券号',
  course_name: '课程',
  amount: '金额',
  total: '总数量',
  used: '已使用',
  available: '可用数量',
  expire_days: '有效期(天)',
  is_expired: '状态',
  created_at: '创建时间',
  expire_time: '过期时间',
  actions: '操作'
};

// 搜索模式类型
type SearchMode = 'card_no' | 'course';

// 搜索参数接口
interface CardSearchParams {
  card_no?: string;
  course_id?: number;
}

interface CardsTableProps {
  data: Card[]
  columns: ColumnDef<Card>[]
  isLoading?: boolean
  pageCount: number
  pageSize: PageSizeOption
  currentPage: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: PageSizeOption) => void
  onSearch: (params: CardSearchParams) => void
  pageSizeOptions?: readonly number[]
  onRowSelectionChange?: (rows: Card[]) => void
  selectedRows?: Card[]
  onResetSelection?: (resetFn: () => void) => void
  onViewCard?: (card: Card) => void
  className?: string
  courses?: Array<{id: number; name: string; category_level1?: string; category_level2?: string}>
}

// 使用memo包装组件，避免不必要的重渲染
export const CardsTable = memo(function CardsTableComponent({
  data,
  columns,
  isLoading = false,
  pageCount,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  onSearch,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  onRowSelectionChange,
  selectedRows = [],
  onResetSelection,
  onViewCard,
  className,
  courses = [],
}: CardsTableProps) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [pageInputValue, setPageInputValue] = useState<string>(currentPage.toString())
  const [cardNoKeyword, setCardNoKeyword] = useState('')
  const [searchMode, setSearchMode] = useState<SearchMode>('card_no') // 默认使用卡券号搜索
  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>(undefined)

  // 当 currentPage 变化时更新输入框值
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
  
  // 当行选择变化时，通知父组件
  useEffect(() => {
    // 避免初始渲染时触发更新
    if (!onRowSelectionChange) return;
    
    const rowSelectionKeys = Object.keys(rowSelection);
    // 如果同时为空，不需要更新
    if (rowSelectionKeys.length === 0 && selectedRows.length === 0) {
      return;
    }

    // 从rowSelection映射到实际的行数据
    const selectedRowsData = rowSelectionKeys
      .filter(key => rowSelection[key])
      .map(key => {
        const index = parseInt(key);
        return index >= 0 && index < data.length ? data[index] : null;
      })
      .filter(Boolean) as Card[];
    
    // 仅当选中行数据发生实质性变化时才触发回调
    const currentIds = selectedRowsData.map(row => row.id).sort().join(',');
    const prevIds = selectedRows.map(row => row.id).sort().join(',');
    
    if (currentIds !== prevIds) {
      // 使用防抖避免快速连续更新
      const timeoutId = setTimeout(() => {
        onRowSelectionChange(selectedRowsData);
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }
  }, [rowSelection, data, onRowSelectionChange, selectedRows]);
  
  // 当selectedRows从父组件变化时，同步rowSelection状态
  useEffect(() => {
    // 跳过初始化或空值
    if (!selectedRows || data.length === 0) return;
    
    // 如果selectedRows为空数组，则清空选择
    if (selectedRows.length === 0) {
      if (Object.keys(rowSelection).length > 0) {
        setRowSelection({});
      }
      return;
    }
    
    // 只有当selectedRows真正变化时才更新rowSelection
    const currentIds = selectedRows.map(row => row.id).sort().join(',');
    const currentSelectionIds = Object.keys(rowSelection)
      .filter(key => rowSelection[key])
      .map(key => {
        const index = parseInt(key);
        return index >= 0 && index < data.length ? data[index].id : null;
      })
      .filter(Boolean)
      .sort()
      .join(',');
    
    if (currentIds !== currentSelectionIds) {
      // 创建一个新的选择映射
      const selectionMap: Record<string, boolean> = {};
      
      // 为每个选中的行设置选择状态
      data.forEach((row, index) => {
        if (selectedRows.some(selectedRow => selectedRow.id === row.id)) {
          selectionMap[index] = true;
        }
      });
      
      setRowSelection(selectionMap);
    }
  }, [selectedRows, data, rowSelection]);
  
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      columnVisibility,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: pageCount,
  })

  // 处理行点击事件
  const handleRowClick = (e: React.MouseEvent, row: Card) => {
    // 如果是点击在操作按钮区域上，不触发行点击事件
    if ((e.target as HTMLElement).closest('[data-prevent-row-click="true"]')) {
      return;
    }
    
    // 如果是点击在复选框上，不触发行点击事件
    if ((e.target as HTMLElement).closest('.checkbox-cell')) {
      return;
    }
    
    if (onViewCard) {
      onViewCard(row);
    }
  };

  // 处理搜索模式变化
  const handleSearchModeChange = (mode: SearchMode) => {
    setSearchMode(mode);
    setCardNoKeyword(''); // 切换模式时清空关键字
  };

  // 获取当前关键字
  const getCurrentKeyword = () => {
    if (searchMode === 'card_no') {
      return cardNoKeyword;
    }
    return '';
  };

  // 设置当前关键字
  const setCurrentKeyword = (value: string) => {
    if (searchMode === 'card_no') {
      setCardNoKeyword(value);
    }
  };

  // 获取搜索框占位符
  const getPlaceholder = () => {
    if (searchMode === 'card_no') {
      return '搜索卡券号...';
    }
    return '搜索...';
  };

  // 获取搜索模式文本
  const getSearchModeText = () => {
    if (searchMode === 'card_no') {
      return '卡券号';
    }
    return '未知';
  };

  // 处理课程筛选变化
  const handleCourseChange = (courseId: string) => {
    const id = courseId === '0' ? undefined : parseInt(courseId);
    setSelectedCourseId(id);
    
    // 直接触发搜索
    const params: CardSearchParams = {};
    
    if (searchMode === 'card_no' && cardNoKeyword) {
      params.card_no = cardNoKeyword;
    }
    
    if (id !== undefined) {
      params.course_id = id;
    }
    
    onSearch(params);
  };

  // 处理搜索
  const handleSearch = () => {
    const params: CardSearchParams = {};
    
    if (searchMode === 'card_no' && cardNoKeyword) {
      params.card_no = cardNoKeyword;
    }
    
    if (selectedCourseId !== undefined) {
      params.course_id = selectedCourseId;
    }
    
    onSearch(params);
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 处理页码输入变化
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInputValue(e.target.value);
  };

  // 处理页码输入键盘事件
  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePageJump();
    }
  };

  // 处理页码跳转
  const handlePageJump = () => {
    const pageNumber = parseInt(pageInputValue);
    if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > pageCount) {
      setPageInputValue(currentPage.toString());
      return;
    }
    if (onPageChange) {
      onPageChange(pageNumber);
    }
  };

  // 使用useMemo缓存表格渲染
  const renderTable = useMemo(() => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="whitespace-nowrap">
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
            Array(5).fill(0).map((_, rowIndex) => (
              <TableRow key={`skeleton-row-${rowIndex}`}>
                {Array(columns.length).fill(0).map((_, cellIndex) => (
                  <TableCell key={`skeleton-cell-${rowIndex}-${cellIndex}`} className="py-3">
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={(e) => handleRowClick(e, row.original)}
                className="cursor-pointer"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className={cell.column.id === 'select' ? 'checkbox-cell' : ''}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                没有数据
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  ), [table, isLoading, columns, handleRowClick, onViewCard]);

  // 使用useMemo缓存分页控件渲染
  const renderPagination = useMemo(() => (
    <div className="flex items-center justify-end space-x-2 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        {selectedRows.length > 0 && (
          <div>已选择 {selectedRows.length} 项</div>
        )}
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            title="首页"
          >
            <IconChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 px-2"
            onClick={() => onPageChange(currentPage - 1)}
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
            className="h-8 px-2"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === pageCount}
          >
            下一页
            <IconChevronRight className="h-4 w-4 ml-1" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange(pageCount)}
            disabled={currentPage === pageCount}
            title="末页"
          >
            <IconChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  ), [currentPage, pageCount, pageInputValue, selectedRows.length, onPageChange]);

  // 格式化课程显示文本
  const formatCourseText = (course: {id: number; name: string; category_level1?: string; category_level2?: string}) => {
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
  };

  return (
    <div className={`space-y-4 ${className || ''}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex items-center max-w-sm">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2 border-r-0 rounded-r-none">
                {getSearchModeText()}
                <IconChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleSearchModeChange('card_no')}>
                卡券号
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Input
            placeholder={getPlaceholder()}
            value={getCurrentKeyword()}
            onChange={(e) => setCurrentKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="rounded-l-none pr-10"
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

        <div className="flex items-center gap-2">
          {/* 课程筛选下拉菜单 */}
          {courses.length > 0 && (
            <Select
              value={selectedCourseId?.toString() || '0'}
              onValueChange={handleCourseChange}
            >
              <SelectTrigger className="h-8 w-[180px] text-sm">
                {selectedCourseId ? (
                  <div className="flex items-center w-full max-w-[calc(100%-8px)]">
                    <span className="truncate flex-1 mr-2">
                      {courses.find(c => c.id === selectedCourseId) ? 
                        formatCourseText(courses.find(c => c.id === selectedCourseId)!) : 
                        '课程'
                      }
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                      (ID:{selectedCourseId})
                    </span>
                  </div>
                ) : (
                  <SelectValue placeholder="筛选课程" />
                )}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">全部课程</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()} className="py-2 text-sm">
                    <div className="flex items-center w-full">
                      <span className="line-clamp-1 flex-1 mr-2">{formatCourseText(course)}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">(ID:{course.id})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

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
                  onClick={() => onPageSizeChange(size as PageSizeOption)}
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

      {renderTable}
      {renderPagination}
    </div>
  )
}) 