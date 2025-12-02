import { useState, useRef } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { createColumns } from './components/cards-columns'
import { CardsTable } from './components/cards-table'
import { Card, CardList, cardListSchema } from './data/schema'
import { cardsApi, coursesApi, useDeduplicatedEffect } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { Search } from '@/components/search'
import { Button } from '@/components/ui/button'
import { IconPlus, IconRefresh } from '@tabler/icons-react'
import { ScrollToTop } from '@/components/scroll-to-top'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { CardsViewDialog } from './components/cards-view-dialog'
import { CardsEditDialog } from './components/cards-edit-dialog'

// 可选的每页数据条数
export const PAGE_SIZE_OPTIONS = [10, 50, 100, 200] as const;
export type PageSizeOption = typeof PAGE_SIZE_OPTIONS[number];

// 搜索参数接口
interface CardSearchParams {
  card_no?: string;
  course_id?: number;
  page?: number;
  size?: number;
}

export default function Cards() {
  const [isLoading, setIsLoading] = useState(true)
  const [cardList, setCardList] = useState<CardList | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSizeOption>(10)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [cardToEdit, setCardToEdit] = useState<Card | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [cardToDelete, setCardToDelete] = useState<Card | null>(null)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const resetSelectionRef = useRef<(() => void) | null>(null)
  const { toast } = useToast()
  const [searchParams, setSearchParams] = useState<CardSearchParams>({
    page: 1,
    size: 10
  });
  const [selectedRows, setSelectedRows] = useState<Card[]>([])
  const [courses, setCourses] = useState<Array<{ id: number; name: string; category_level1?: string; category_level2?: string; }>>([])

  // 获取卡券列表
  const fetchCards = async (params: CardSearchParams = {}) => {
    setIsLoading(true)
    try {
      // 构建请求参数，过滤掉空值
      const requestParams: CardSearchParams = {
        // 添加分页参数
        page: params.page || currentPage,
        size: params.size || pageSize,
      };
      
      // 添加搜索参数 - 只添加非空值
      if (params.card_no) {
        requestParams.card_no = params.card_no;
      }
      
      if (params.course_id) {
        requestParams.course_id = params.course_id;
      }
      
      console.log('卡券请求参数:', requestParams);
      
      const response = await cardsApi.getCards(requestParams)
      
      console.log('卡券API响应:', response)
      
      if (response.code === 200) {
        const adaptedData = {
          items: response.data.items || [],
          total: response.data.total || 0
        }
        try {
          const parsedData = cardListSchema.parse(adaptedData)
          setCardList(parsedData)
        } catch (error) {
          console.error('卡券数据解析错误:', error)
          toast({
            variant: "destructive",
            title: "数据格式错误",
            description: "卡券数据格式不符合预期",
          })
        }
      } else {
        toast({
          variant: "destructive",
          title: "获取卡券失败",
          description: response.msg || "加载卡券列表时出现错误",
        })
      }
    } catch (error) {
      console.error('获取卡券错误:', error)
      toast({
        variant: "destructive",
        title: "获取卡券失败",
        description: "加载卡券列表时出现错误",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 获取课程列表（用于创建和编辑卡券）
  const fetchCourses = async () => {
    try {
      const response = await coursesApi.getCourses({
        size: 100, // 获取较多课程用于筛选
      })
      
      if (response.code === 200 && response.data?.items) {
        setCourses(response.data.items)
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
    fetchCards(updatedParams);
  }, [currentPage, pageSize, searchParams], { dedupTime: 300 })

  // 初始加载时获取课程列表
  useDeduplicatedEffect(() => {
    fetchCourses()
  }, [], { dedupTime: 300 })

  // 搜索处理
  const handleSearch = (params: CardSearchParams) => {
    // 创建一个新的搜索参数对象，只包含有值的参数
    const newParams: CardSearchParams = { page: 1 }; // 重置页码
    
    // 只添加有值的参数
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        newParams[key as keyof CardSearchParams] = value;
      }
    });
    
    console.log('新的搜索参数:', newParams);
    
    // 保存搜索参数 - 完全替换而不是合并
    setSearchParams(newParams);
    // 重置页码
    setCurrentPage(1);
  }

  // 处理页面大小变化
  const handlePageSizeChange = (size: PageSizeOption) => {
    setPageSize(size);
    setCurrentPage(1); // 改变每页条数时重置到第一页
    
    // 更新搜索参数中的size
    const newParams = { ...searchParams, size, page: 1 };
    setSearchParams(newParams);
  }

  // 处理页码变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  }

  // 处理查看卡券详情
  const handleViewCard = (card: Card) => {
    setSelectedCard(card);
    setIsViewDialogOpen(true);
  }

  // 处理创建新卡券
  const handleCreateCard = () => {
    setCardToEdit(null);
    setIsEditDialogOpen(true);
  }

  // 处理编辑卡券 - 直接打开编辑对话框，不经过详情页
  const handleEditCard = (card: Card) => {
    // 设置要编辑的卡券并打开编辑对话框
    setCardToEdit(card);
    setIsEditDialogOpen(true);
  }

  // 从详情页编辑卡券
  const handleEditFromDetails = (card: Card) => {
    // 先关闭详情对话框
    setIsViewDialogOpen(false);
    
    // 延迟一下再打开编辑对话框，避免两个对话框同时出现
    setTimeout(() => {
      setCardToEdit(card);
      setIsEditDialogOpen(true);
    }, 300);
  }

  // 处理删除卡券
  const handleDeleteCard = (card: Card) => {
    setCardToDelete(card);
    setIsDeleteDialogOpen(true);
  }
  
  // 从详情页删除卡券
  const handleDeleteFromDetails = (card: Card) => {
    // 先关闭详情对话框
    setIsViewDialogOpen(false);
    
    // 延迟一下再打开删除对话框，避免两个对话框同时出现
    setTimeout(() => {
      setCardToDelete(card);
      setIsDeleteDialogOpen(true);
    }, 300);
  }

  // 处理确认删除
  const handleConfirmDelete = async () => {
    if (!cardToDelete) return;
    
    setIsDeleteLoading(true);
    
    try {
      const response = await cardsApi.deleteCard(cardToDelete.id);
      
      if (response.code === 200) {
        toast({
          title: "删除成功",
          description: `卡券 ${cardToDelete.card_no} 已成功删除`,
        });
        
        // 关闭对话框
        setIsDeleteDialogOpen(false);
        
        // 刷新卡券列表
        fetchCards(searchParams);
      } else {
        toast({
          variant: "destructive",
          title: "删除失败",
          description: response.msg || "无法删除卡券",
        });
      }
    } catch (error) {
      console.error('删除卡券错误:', error);
      toast({
        variant: "destructive",
        title: "删除失败",
        description: "删除卡券时出现错误",
      });
    } finally {
      setIsDeleteLoading(false);
    }
  }

  // 处理行选择变化
  const handleRowSelectionChange = (rows: Card[]) => {
    // 更新选中行
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
    
    // 重置页码
    setCurrentPage(1);
    
    // 触发行选择重置
    if (resetSelectionRef.current) {
      resetSelectionRef.current();
    }
    
    // 刷新数据
    fetchCards(newParams);
  }

  // 创建列定义，传入动作处理函数
  const columns = createColumns({
    onView: handleViewCard,
    onEdit: handleEditCard,
    onDelete: handleDeleteCard,
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
            <h2 className='text-2xl font-bold tracking-tight'>卡券管理</h2>
            <p className='text-muted-foreground'>
              管理课程的卡券和兑换码
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleCreateCard}>
              <IconPlus className="mr-2 h-4 w-4" />
              新建卡券
            </Button>
            <Button variant="outline" onClick={handleRefresh} className="space-x-1">
              <span>刷新</span> <IconRefresh size={18} />
            </Button>
          </div>
        </div>
        
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {cardList && (
            <CardsTable 
              data={cardList.items} 
              columns={columns} 
              isLoading={isLoading}
              pageCount={Math.ceil(cardList.total / pageSize)}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onSearch={handleSearch}
              pageSize={pageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onRowSelectionChange={handleRowSelectionChange}
              selectedRows={selectedRows}
              onResetSelection={(resetFn) => {
                resetSelectionRef.current = resetFn;
              }}
              onViewCard={handleViewCard}
              courses={courses}
            />
          )}
        </div>
      </Main>

      <ScrollToTop zIndex={100} />

      {/* 卡券查看对话框 */}
      {selectedCard && (
        <CardsViewDialog
          open={isViewDialogOpen}
          onOpenChange={(open) => {
            setIsViewDialogOpen(open);
            if (!open) {
              // 当关闭详情对话框时，延迟清空选中的卡券，避免闪烁
              setTimeout(() => {
                if (!isEditDialogOpen) {
                  setSelectedCard(null);
                }
              }, 300);
            }
          }}
          currentRow={selectedCard}
          onEdit={handleEditFromDetails}
          onDelete={handleDeleteFromDetails}
        />
      )}

      {/* 编辑/创建卡券对话框 */}
      <CardsEditDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            // 当关闭编辑对话框时，延迟清空要编辑的卡券，避免闪烁
            setTimeout(() => {
              setCardToEdit(null);
            }, 300);
          }
        }}
        currentRow={cardToEdit}
        courses={courses}
        onSuccess={fetchCards}
      />

      {/* 删除确认对话框 */}
      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="确认删除卡券"
        description={
          cardToDelete ? (
            <>
              您确定要删除这个卡券吗？此操作不可逆。
              <div className="mt-2 p-2 bg-muted rounded-md">
                <div className="font-medium">卡券号:</div>
                <div className="text-sm">{cardToDelete.card_no}</div>
                <div className="font-medium mt-1">课程:</div>
                <div className="text-sm">{cardToDelete.course_name}</div>
              </div>
            </>
          ) : "您确定要删除这个卡券吗？"
        }
        onConfirm={handleConfirmDelete}
        isLoading={isDeleteLoading}
      />
    </>
  )
} 