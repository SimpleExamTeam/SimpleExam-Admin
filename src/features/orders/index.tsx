import { useState, useRef, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { createColumns } from './components/orders-columns'
import { OrdersTable } from './components/orders-table'
import { Order, OrderList, orderListSchema } from './data/schema'
import { ordersApi, useDeduplicatedEffect } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { OrdersViewDialog } from './components/orders-view-dialog'
import { OrdersRefundDialog } from './components/orders-refund-dialog'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { Search } from '@/components/search'
import { Button } from '@/components/ui/button'
import { IconRefresh } from '@tabler/icons-react'
import { useOrdersContext } from '@/context/orders-context'
import { ScrollToTop } from '@/components/scroll-to-top'

// 可选的每页数据条数
export const PAGE_SIZE_OPTIONS = [10, 50, 100, 200] as const;
export type PageSizeOption = typeof PAGE_SIZE_OPTIONS[number];

// 搜索参数接口
interface OrderSearchParams {
  order_no?: string;
  username?: string;
  user_id?: string;
  status?: string;
  payment_type?: string;
  start_time?: string;
  end_time?: string;
  page?: number;
  size?: number;
}

export default function Orders() {
  const [isLoading, setIsLoading] = useState(true)
  const [orderList, setOrderList] = useState<OrderList | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSizeOption>(10)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false)
  const [orderToRefund, setOrderToRefund] = useState<Order | null>(null)
  const resetSelectionRef = useRef<(() => void) | null>(null)
  const { toast } = useToast()
  const [searchParams, setSearchParams] = useState<OrderSearchParams>({
    page: 1,
  });
  
  // 获取订单上下文
  const ordersContext = useOrdersContext();

  // 当上下文中的搜索参数变化时，更新本地搜索参数
  useEffect(() => {
    if (ordersContext && ordersContext.searchParams) {
      // 使用上下文中的搜索参数
      setSearchParams(ordersContext.searchParams);
      
      // 如果有用户ID搜索参数，自动切换到用户ID搜索模式
      if (ordersContext.searchParams.user_id) {
        // 更新表格组件的搜索模式和关键字
        const tableComponent = document.querySelector('.orders-table') as HTMLElement;
        if (tableComponent) {
          // 这里可以添加一些UI更新逻辑，如果需要的话
        }
      }
    }
  }, [ordersContext]);

  const fetchOrders = async (params: OrderSearchParams = {}) => {
    setIsLoading(true)
    try {
      // 构建请求参数，过滤掉空值
      const requestParams: OrderSearchParams = {
        // 添加分页参数
        page: params.page || currentPage,
        size: params.size || pageSize,
      };
      
      // 添加搜索参数 - 只添加非空值
      if (params.order_no) {
        requestParams.order_no = params.order_no;
      }
      
      if (params.username) {
        requestParams.username = params.username;
      }
      
      if (params.user_id) {
        requestParams.user_id = params.user_id;
        console.log('fetchOrders: 设置user_id参数 =', params.user_id);
      }
      
      if (params.status) {
        requestParams.status = params.status;
      }
      
      if (params.payment_type) {
        requestParams.payment_type = params.payment_type;
      }
      
      // 添加日期范围
      if (params.start_time) {
        requestParams.start_time = params.start_time;
      }
      
      if (params.end_time) {
        requestParams.end_time = params.end_time;
      }
      
      console.log('订单请求参数:', requestParams);
      
      const response = await ordersApi.getOrders(requestParams) as any
      
      console.log('订单API响应:', response)
      
      if (response.code === 200) {
        const adaptedData = {
          items: response.data.items || [],
          total: response.data.total || 0
        }
        try {
          const parsedData = orderListSchema.parse(adaptedData)
          setOrderList(parsedData)
        } catch (error) {
          console.error('订单数据解析错误:', error)
          toast({
            variant: "destructive",
            title: "数据格式错误",
            description: "订单数据格式不符合预期",
          })
        }
      } else {
        toast({
          variant: "destructive",
          title: "获取订单失败",
          description: response.message || "加载订单列表时出现错误",
        })
      }
    } catch (error) {
      console.error('获取订单错误:', error)
      toast({
        variant: "destructive",
        title: "获取订单失败",
        description: "加载订单列表时出现错误",
      })
    } finally {
      setIsLoading(false)
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
    fetchOrders(updatedParams);
  }, [currentPage, pageSize, searchParams], { dedupTime: 300 })

  const handleSearch = (params: OrderSearchParams) => {
    // 创建一个新的搜索参数对象，只包含有值的参数
    const newParams: OrderSearchParams = { page: 1 }; // 重置页码
    
    // 只添加有值的参数
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        newParams[key as keyof OrderSearchParams] = value;
        // 特别记录用户ID参数
        if (key === 'user_id') {
          console.log('handleSearch: 添加user_id参数 =', value);
        }
      }
    });
    
    console.log('新的搜索参数:', newParams);
    
    // 保存搜索参数 - 完全替换而不是合并
    setSearchParams(newParams);
    // 重置页码
    setCurrentPage(1);
    
    // 同步更新上下文中的搜索参数
    if (ordersContext) {
      ordersContext.handleSearch(newParams);
    }
  };

  const handlePageSizeChange = (size: PageSizeOption) => {
    setPageSize(size);
    setCurrentPage(1); // 改变每页条数时重置到第一页
    
    // 更新搜索参数中的size
    const newParams = { ...searchParams, size, page: 1 };
    setSearchParams(newParams);
    
    // 同步更新上下文中的搜索参数
    if (ordersContext) {
      ordersContext.handleSearch(newParams);
    }
  };

  const handleDateRangeChange = (dateRange: { start_time?: string; end_time?: string }) => {
    // 更新日期范围参数
    const newParams: OrderSearchParams = { ...searchParams };
    
    if (dateRange.start_time) {
      newParams.start_time = dateRange.start_time;
    } else if (newParams.start_time) {
      newParams.start_time = undefined;
    }
    
    if (dateRange.end_time) {
      newParams.end_time = dateRange.end_time;
    } else if (newParams.end_time) {
      newParams.end_time = undefined;
    }
    
    newParams.page = 1; // 日期筛选时重置到第一页
    setSearchParams(newParams);
    setCurrentPage(1);
    
    // 同步更新上下文中的搜索参数
    if (ordersContext) {
      ordersContext.handleSearch(newParams);
    }
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsViewDialogOpen(true)
  }

  const handleViewDialogOpenChange = (open: boolean) => {
    setIsViewDialogOpen(open)
    if (!open) {
      setSelectedOrder(null)
    }
  }

  const handleDeleteOrder = (order: Order) => {
    setOrderToDelete(order)
    setIsDeleteDialogOpen(true)
  }

  const handleRefundOrder = (order: Order) => {
    setOrderToRefund(order)
    setIsRefundDialogOpen(true)
  }

  const handleRefundDialogOpenChange = (open: boolean) => {
    setIsRefundDialogOpen(open)
    if (!open) {
      setOrderToRefund(null)
    }
  }

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return

    try {
      const response = await ordersApi.deleteOrder(orderToDelete.id) as any
      if (response.code === 200) {
        toast({
          title: "订单已删除",
          description: `订单 "${orderToDelete.order_no}" 已被成功删除`,
        })
        fetchOrders(searchParams)
      } else {
        toast({
          variant: "destructive",
          title: "删除订单失败",
          description: response.message || "删除订单时出现错误",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "删除订单失败",
        description: "删除订单时出现错误",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setOrderToDelete(null)
    }
  }

  // 创建列定义，传入动作处理函数
  const orderColumns = createColumns({
    onView: handleViewOrder,
    onDelete: handleDeleteOrder,
    onRefund: handleRefundOrder
  });

  // 处理刷新按钮点击
  const handleRefresh = () => {
    // 重置筛选状态
    const newParams = { page: 1 };
    setSearchParams(newParams);
    // 重置页码
    setCurrentPage(1);
    // 触发行选择重置
    if (resetSelectionRef.current) {
      resetSelectionRef.current();
    }
    // 刷新数据
    fetchOrders(newParams);
    
    // 同步更新上下文中的搜索参数
    if (ordersContext) {
      ordersContext.clearSearch();
    }
  };

  // 处理重置搜索条件
  const handleResetFilters = () => {
    // 创建一个空的搜索参数对象，只保留页码和每页条数
    const newParams = { 
      page: 1,
      size: pageSize
    };
    
    // 更新本地状态
    setSearchParams(newParams);
    setCurrentPage(1);
    
    // 同步更新上下文中的搜索参数
    if (ordersContext) {
      ordersContext.clearSearch();
    }
    
    // 重新获取数据
    fetchOrders(newParams);
  };

  // 处理页面变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 不需要在这里调用fetchOrders，由useDeduplicatedEffect处理
  };

  const pageCount = orderList ? Math.ceil(orderList.total / pageSize) : 0;

  return (
    <>
      <Header fixed>
        <Search placeholder="搜索订单..." />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>订单管理</h2>
            <p className='text-muted-foreground'>
              管理用户的课程订单和支付信息
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="space-x-1"
            >
              <span>刷新</span>
              <IconRefresh size={18} />
            </Button>
          </div>
        </div>
        
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <OrdersTable
            data={orderList?.items || []}
            columns={orderColumns}
            isLoading={isLoading}
            pageCount={pageCount}
            currentPage={currentPage}
            pageSize={pageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSearch={handleSearch}
            onDateRangeChange={handleDateRangeChange}
            onResetSelection={(resetFn) => {
              resetSelectionRef.current = resetFn
            }}
            onViewOrder={handleViewOrder}
            onReset={handleResetFilters}
          />
        </div>
      </Main>
      
      <OrdersViewDialog 
        open={isViewDialogOpen}
        onOpenChange={handleViewDialogOpenChange}
        currentRow={selectedOrder}
      />
      
      <ConfirmDeleteDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="确认删除订单"
        description={`您确定要删除订单 ${orderToDelete?.order_no || ''} 吗？此操作不可撤销。`}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />

      <OrdersRefundDialog
        open={isRefundDialogOpen}
        onOpenChange={handleRefundDialogOpenChange}
        order={orderToRefund}
        onSuccess={handleRefresh}
      />
      
      <ScrollToTop zIndex={100} />
    </>
  )
} 