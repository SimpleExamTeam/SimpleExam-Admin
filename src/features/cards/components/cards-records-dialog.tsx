import { useState, useEffect } from 'react'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  BlurDialog,
  BlurDialogContent,
} from '@/components/ui/blur-dialog'
import { Card, CardRecord } from '../data/schema'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { cardsApi } from '@/lib/api'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDate } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  IconChevronLeft, 
  IconChevronRight, 
  IconChevronsLeft,
  IconChevronsRight,
  IconAlertCircle,
  IconRefresh,
} from '@tabler/icons-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface CardsRecordsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentCard: Card | null
}

export function CardsRecordsDialog({
  open,
  onOpenChange,
  currentCard,
}: CardsRecordsDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [records, setRecords] = useState<CardRecord[]>([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [pageCount, setPageCount] = useState(1)
  const [pageInputValue, setPageInputValue] = useState('1')
  const [error, setError] = useState<string | null>(null)

  // 获取卡券兑换记录
  const fetchCardRecords = async () => {
    if (!currentCard) return
    
    setIsLoading(true)
    setError(null)
    try {
      const response = await cardsApi.getCardRecords(currentCard.id, {
        page: currentPage,
        size: pageSize
      })
      
      if (response.code === 200) {
        try {
          // API返回的是数组而不是对象，直接处理数组数据
          if (Array.isArray(response.data)) {
            // 直接使用数组数据
            setRecords(response.data)
            setTotalRecords(response.data.length)
            // 由于无法获取总页数，假设当前页即为全部数据
            setPageCount(1)
          } else if (response.data && typeof response.data === 'object') {
            // 检查是否包含items和total属性
            if (Array.isArray(response.data.items)) {
              setRecords(response.data.items)
              setTotalRecords(response.data.total || response.data.items.length)
              setPageCount(Math.ceil((response.data.total || response.data.items.length) / pageSize))
            } else {
              // 将对象本身作为单条记录处理
              const recordArray = [response.data];
              setRecords(recordArray)
              setTotalRecords(1)
              setPageCount(1)
            }
          } else {
            // 数据为空或无效格式
            setRecords([])
            setTotalRecords(0)
            setPageCount(1)
          }
        } catch (error) {
          console.error('卡券兑换记录数据解析错误:', error)
          // 出错时设置为空列表
          setRecords([])
          setTotalRecords(0)
          setPageCount(1)
          setError('数据格式不符合预期，请稍后再试')
          
          toast({
            variant: "destructive",
            title: "数据格式错误",
            description: "卡券兑换记录数据格式不符合预期",
          })
        }
      } else {
        setRecords([])
        setTotalRecords(0)
        setPageCount(1)
        setError(response.msg || '无法加载卡券兑换记录')
        
        toast({
          variant: "destructive",
          title: "获取兑换记录失败",
          description: response.msg || "无法加载卡券兑换记录",
        })
      }
    } catch (error) {
      console.error('获取卡券兑换记录错误:', error)
      setRecords([])
      setTotalRecords(0)
      setPageCount(1)
      setError('网络错误，请检查网络连接后重试')
      
      toast({
        variant: "destructive",
        title: "获取兑换记录失败",
        description: "加载卡券兑换记录时出现错误",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 当对话框打开或currentCard/page变化时获取数据
  useEffect(() => {
    if (open && currentCard) {
      fetchCardRecords()
    }
  }, [open, currentCard, currentPage])
  
  // 处理页码变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setPageInputValue(page.toString())
  }
  
  // 处理页码输入
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInputValue(e.target.value)
  }

  // 处理页码输入键盘事件
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
    handlePageChange(pageNumber)
  }

  return (
    <BlurDialog open={open} onOpenChange={onOpenChange}>
      <BlurDialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader className="text-left">
          <DialogTitle className="text-foreground/90 text-xl">卡券兑换记录</DialogTitle>
          <DialogDescription className="text-muted-foreground/90 flex items-center gap-2">
            查看卡券 <span className="font-medium">{currentCard?.card_no}</span> 的兑换使用记录
            {isLoading && (
              <span className="inline-flex items-center text-xs text-muted-foreground/70 gap-1 ml-2 animate-pulse">
                <IconRefresh className="h-3 w-3 animate-spin" />
                加载中...
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="py-4 max-h-[65vh] pr-2 scrollbar-thin">
          <div className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 flex items-center gap-2 animate-in fade-in-50 duration-300">
                <IconAlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                <div className="text-sm text-destructive flex-1">{error}</div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  onClick={fetchCardRecords}
                  disabled={isLoading}
                >
                  <IconRefresh className={cn("h-3.5 w-3.5", {
                    "animate-spin": isLoading
                  })} />
                  <span className="sr-only">刷新</span>
                </Button>
              </div>
            )}
          
            <div className="rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm transition-all duration-200">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[80px] whitespace-nowrap text-center">序号</TableHead>
                    <TableHead className="whitespace-nowrap">用户信息</TableHead>
                    <TableHead className="whitespace-nowrap">课程信息</TableHead>
                    <TableHead className="text-right whitespace-nowrap">兑换时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(5).fill(0).map((_, index) => (
                      <TableRow key={`skeleton-${index}`} className="hover:bg-transparent">
                        <TableCell className="py-3 text-center">
                          <Skeleton className="h-4 w-12 mx-auto" />
                        </TableCell>
                        <TableCell className="py-3">
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </TableCell>
                        <TableCell className="py-3">
                          <Skeleton className="h-4 w-48 mb-1" />
                          <Skeleton className="h-3 w-16" />
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <Skeleton className="h-4 w-32 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : records.length > 0 ? (
                    records.map((record, index) => (
                      <TableRow key={record.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="text-center font-medium">
                          {(currentPage - 1) * pageSize + index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium flex items-center gap-1">
                            {record.nickname || record.username || '未知用户'}
                            {!(record.nickname || record.username) && (
                              <span className="text-destructive/70 text-xs border border-destructive/30 rounded px-1 py-0.5">无名称</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <span className="bg-muted/50 px-1.5 py-0.5 rounded text-muted-foreground">
                              ID: {record.user_id || '-'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium flex items-center gap-1">
                            {record.course_name || '未知课程'}
                            {!record.course_name && (
                              <span className="text-destructive/70 text-xs border border-destructive/30 rounded px-1 py-0.5">无名称</span>
                            )}
                          </div>
                          {record.course_id && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <span className="bg-muted/50 px-1.5 py-0.5 rounded text-muted-foreground">
                                ID: {record.course_id}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          <div className="text-foreground">{formatDate(record.created_at)}</div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <div className="text-sm">暂无兑换记录</div>
                          {!error && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="mt-2 text-xs h-7 px-2"
                              onClick={fetchCardRecords}
                              disabled={isLoading}
                            >
                              <IconRefresh className={cn("h-3 w-3 mr-1", {
                                "animate-spin": isLoading
                              })} />
                              刷新
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {records.length > 0 && totalRecords > pageSize && (
              <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                  共 <span className="font-medium text-foreground">{totalRecords}</span> 条记录
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1 || isLoading}
                    title="首页"
                  >
                    <IconChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 px-2"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
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
                        disabled={isLoading}
                      />
                    </div>
                    <span className="text-sm font-medium">/ {pageCount} 页</span>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="h-8 px-2"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pageCount || isLoading}
                  >
                    下一页
                    <IconChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                  <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => handlePageChange(pageCount)}
                    disabled={currentPage === pageCount || isLoading}
                    title="末页"
                  >
                    <IconChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {records.length > 0 && totalRecords <= pageSize && (
              <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                  共 <span className="font-medium text-foreground">{totalRecords}</span> 条记录
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-4">
          <div className="flex w-full justify-end items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="h-8 hover:bg-background/60 backdrop-blur-sm border-background/20 text-sm"
            >
              关闭
            </Button>
            <Button
              variant="default"
              onClick={fetchCardRecords}
              disabled={isLoading}
              className={cn("h-8 text-sm", {
                "bg-primary/80": isLoading
              })}
            >
              <IconRefresh className={cn("h-3.5 w-3.5 mr-1", {
                "animate-spin": isLoading
              })} />
              {isLoading ? "加载中" : "刷新"}
            </Button>
          </div>
        </DialogFooter>
      </BlurDialogContent>
    </BlurDialog>
  )
} 