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
import { Question } from '../data/schema'
import { PAGE_SIZE_OPTIONS, type PageSizeOption } from '..'
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
  question: '题目内容',
  type: '题目类型',
  course: '所属课程',
  category_level1: '一级分类',
  category_level2: '二级分类',
  answer: '答案',
  created_at: '创建时间',
  actions: '操作'
};

// 搜索模式类型
type SearchMode = 'question' | 'questionId';

// 搜索参数接口
interface QuestionSearchParams {
  question?: string;
  question_id?: number;
  type?: string;
}

interface QuestionsTableProps {
  data: Question[]
  columns: ColumnDef<Question>[]
  isLoading?: boolean
  pageCount: number
  pageSize: PageSizeOption
  currentPage: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: PageSizeOption) => void
  onSearch: (params: QuestionSearchParams) => void
  onTypeFilter: (type: string) => void
  currentType?: string
  onCourseFilter: (value: string) => void
  pageSizeOptions?: readonly number[]
  onRowSelectionChange?: (rows: Question[]) => void
  selectedRows?: Question[]
  onResetSelection?: (resetFn: () => void) => void
  onViewQuestion?: (question: Question) => void
}

// 使用memo包装组件，避免不必要的重渲染
export const QuestionsTable = memo(function QuestionsTableComponent({
  data,
  columns,
  isLoading = false,
  pageCount,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  onSearch,
  onTypeFilter,
  currentType = "",
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  onRowSelectionChange,
  selectedRows = [],
  onResetSelection,
  onViewQuestion,
}: QuestionsTableProps) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [pageInputValue, setPageInputValue] = useState<string>(currentPage.toString())
  const [searchKeyword, setSearchKeyword] = useState('')
  const [questionIdKeyword, setQuestionIdKeyword] = useState('')
  const [searchMode, setSearchMode] = useState<SearchMode>('question') // 默认使用题目内容搜索

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
      .filter(Boolean) as Question[];
    
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
    
    // 如果ID实际上相同，不进行更新
    if (currentIds === currentSelectionIds) {
      return;
    }
    
    // 构建新的选择状态
    const selectionMap: Record<string, boolean> = {};
    
    // 遍历数据，找到匹配的行
    data.forEach((row, index) => {
      if (selectedRows.some(selected => selected.id === row.id)) {
        selectionMap[index] = true;
      }
    });
    
    setRowSelection(selectionMap);
  }, [selectedRows, data]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      columnVisibility,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize,
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount,
  })

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
    onPageChange(pageNumber)
  }

  // 处理行点击事件
  const handleRowClick = (e: React.MouseEvent, row: Question) => {
    // 当点击的是Checkbox或操作按钮时，不触发行点击事件
    const target = e.target as HTMLElement;
    if (
      target.closest('input[type="checkbox"]') ||
      target.closest('button') ||
      target.closest('[role="menuitem"]')
    ) {
      return;
    }
    
    // 如果提供了查看题目的回调，则调用它
    if (onViewQuestion) {
      onViewQuestion(row);
    }
  };

  // 处理搜索模式变化
  const handleSearchModeChange = (mode: SearchMode) => {
    if (mode !== searchMode) {
      setSearchMode(mode);
      // 清空当前搜索关键字
      setSearchKeyword('');
      setQuestionIdKeyword('');
    }
  };

  // 获取当前搜索关键字
  const getCurrentKeyword = () => {
    switch (searchMode) {
      case 'question':
        return searchKeyword;
      case 'questionId':
        return questionIdKeyword;
      default:
        return '';
    }
  };

  // 设置当前搜索关键字
  const setCurrentKeyword = (value: string) => {
    switch (searchMode) {
      case 'question':
        setSearchKeyword(value);
        break;
      case 'questionId':
        setQuestionIdKeyword(value);
        break;
    }
  };

  // 获取搜索框占位符
  const getPlaceholder = () => {
    switch (searchMode) {
      case 'question':
        return '搜索题目内容...';
      case 'questionId':
        return '输入题目ID...';
      default:
        return '搜索...';
    }
  };

  // 获取当前搜索模式文本
  const getSearchModeText = () => {
    switch (searchMode) {
      case 'question':
        return '题目内容';
      case 'questionId':
        return '题目ID';
      default:
        return '搜索';
    }
  };

  // 处理搜索按钮点击
  const handleSearch = () => {
    if (onSearch) {
      const params: QuestionSearchParams = {};
      
      // 根据搜索模式添加对应的搜索参数
      if (searchMode === 'question' && searchKeyword.trim()) {
        params.question = searchKeyword.trim();
        
        // 添加类型筛选
        if (currentType) {
          params.type = currentType;
        }
      } else if (searchMode === 'questionId' && questionIdKeyword.trim()) {
        const questionId = parseInt(questionIdKeyword.trim());
        if (!isNaN(questionId)) {
          // 题目ID搜索时只使用question_id参数
          params.question_id = questionId;
          console.log('设置题目ID搜索参数:', questionId);
          // 题目ID搜索时不添加其他筛选参数
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
                className="cursor-pointer hover:bg-muted/40"
                onClick={(e) => handleRowClick(e, row.original)}
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
                className="h-24 text-center"
              >
                没有结果
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  ), [table, columns, isLoading, handleRowClick]);

  // 使用useMemo缓存分页控件渲染
  const renderPagination = useMemo(() => (
    <div className="flex items-center justify-between space-x-2 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        {selectedRows && selectedRows.length > 0 ? (
          <>已选择 {selectedRows.length} 个题目，</>
        ) : null}
        共 {table.getFilteredRowModel().rows.length} 个题目
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="首页"
        >
          <IconChevronsLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
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
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === pageCount}
        >
          下一页
          <IconChevronRight className="h-4 w-4 ml-1" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pageCount)}
          disabled={currentPage === pageCount}
          title="尾页"
        >
          <IconChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  ), [
    table, 
    pageCount, 
    pageSize, 
    currentPage, 
    pageInputValue, 
    onPageChange, 
    onPageSizeChange, 
    pageSizeOptions,
    handlePageInputChange,
    handlePageInputKeyDown,
    handlePageJump,
    isLoading,
    selectedRows
  ])

  return (
    <div className="space-y-4">
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
              <DropdownMenuItem onClick={() => handleSearchModeChange('question')}>
                题目内容
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSearchModeChange('questionId')}>
                题目ID
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
          <Select
            value={currentType || "all"}
            onValueChange={onTypeFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择题目类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="single">单选题</SelectItem>
              <SelectItem value="multiple">多选题</SelectItem>
              <SelectItem value="judge">判断题</SelectItem>
            </SelectContent>
          </Select>

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