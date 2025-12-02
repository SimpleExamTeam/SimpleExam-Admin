import { useEffect, useState, useRef } from 'react'
import { Search } from '@/components/search'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Overview, OverviewRef } from './components/overview'
import { LoginLogs, LoginLogsRef } from './components/login-logs'
import { useToast } from '@/components/ui/use-toast'
import { systemApi } from '@/lib/api'
import { IconUsers, IconBook2, IconShoppingCart, IconChartBar, IconTrendingUp, IconRefresh } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

// 仪表盘卡片组件
const DashboardCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon,
  isRefreshing
}: { 
  title: string, 
  value: string | number, 
  description: string, 
  icon: React.ComponentType<any>,
  isRefreshing?: boolean
}) => {
  return (
    <motion.div
      animate={{ opacity: isRefreshing ? 0.7 : 1, scale: isRefreshing ? 0.98 : 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface SystemInfo {
  total_users: number;
  total_courses: number;
  orders_count: {
    paid: number;
    total: number;
    pending?: number;
    unpaid?: number;
    cancelled?: number;
    refunded?: number;
  };
  total_income: number;
  current_month_income: number;
  last_month_income: number;
}

// 共享的销售统计数据上下文
export interface SalesStatisticsData {
  currentMonthRevenue: number;
  growthRate: number;
  isLoading: boolean;
  salesStatistics: any; // 销售统计数据，可以传递给Overview组件
}

export default function Dashboard() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [salesData, setSalesData] = useState<SalesStatisticsData>({
    currentMonthRevenue: 0,
    growthRate: 0,
    isLoading: true,
    salesStatistics: null
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()
  
  // 使用ref防止重复请求
  const requestInProgressRef = useRef(false);
  
  // 组件引用
  const loginLogsRef = useRef<LoginLogsRef>(null);
  const overviewRef = useRef<OverviewRef>(null);

  // 获取系统信息
  const fetchSystemInfo = async () => {
    if (requestInProgressRef.current) return;
    
    setIsLoading(true);
    // 确保当月收入也显示为加载中状态
    setSalesData(prev => ({ ...prev, isLoading: true }));
    
    try {
      requestInProgressRef.current = true;
      const response = await systemApi.getSystemInfo();
      
      if (response.code === 200 && response.data) {
        setSystemInfo(response.data);
        
        // 计算增长率并更新销售数据
        if (response.data.current_month_income !== undefined && response.data.last_month_income !== undefined) {
          const currentMonthRevenue = response.data.current_month_income;
          const lastMonthRevenue = response.data.last_month_income;
          
          // 计算环比增长率
          let growthRate = 0;
          if (lastMonthRevenue > 0) {
            growthRate = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
          }
          
          // 更新销售数据状态
          setSalesData(prev => ({
            ...prev,
            currentMonthRevenue,
            growthRate,
            isLoading: false
          }));
          
          console.log('已更新当月收入数据:', { currentMonthRevenue, growthRate });
        } else {
          console.warn('API返回数据缺少当月或上月收入信息');
          // 确保即使API未返回收入数据，也将加载状态设为false
          setSalesData(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        toast({
          variant: "destructive",
          title: "获取系统信息失败",
          description: response.msg || "请求处理失败",
        });
        // 请求失败时也需要重置加载状态
        setSalesData(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('获取系统信息失败:', error);
      toast({
        variant: "destructive",
        title: "获取系统信息失败",
        description: "加载系统信息时出现错误",
      });
      // 错误时也需要重置加载状态
      setSalesData(prev => ({ ...prev, isLoading: false }));
    } finally {
      setIsLoading(false);
      requestInProgressRef.current = false;
    }
  };

  // 获取当月收入和环比增长率
  const fetchSalesStatistics = async () => {
    if (requestInProgressRef.current) return;
    
    setSalesData(prev => ({ ...prev, isLoading: true }))
    try {
      requestInProgressRef.current = true;
      
      // 移除预加载月度数据的逻辑，让Overview组件自己加载数据
      setSalesData(prev => ({
        ...prev,
        isLoading: false,
        salesStatistics: null // 不预设统计数据，让Overview组件自己获取
      }));
    } catch (error) {
      console.error('获取销售统计数据失败:', error)
      toast({
        variant: "destructive",
        title: "获取销售统计数据失败",
        description: "加载销售统计数据时出现错误",
      })
      setSalesData(prev => ({ ...prev, isLoading: false }))
    } finally {
      requestInProgressRef.current = false;
    }
  }
  // 刷新所有仪表盘数据
  const refreshDashboard = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    // 立即将当月收入状态设置为"加载中"
    setSalesData(prev => ({ 
      ...prev, 
      isLoading: true 
    }));
    
    try {
      // 并行请求所有数据，提高刷新速度
      await Promise.all([
        fetchSystemInfo(),
        fetchSalesStatistics(),
      ]);
      
      // 刷新登录日志
      if (loginLogsRef.current) {
        loginLogsRef.current.refreshData();
      }
      
      // 刷新销售统计图表
      if (overviewRef.current) {
        overviewRef.current.refreshData();
      }
      
      toast({
        title: "刷新成功",
        description: "仪表盘数据已更新",
      });
    } catch (error) {
      console.error('刷新数据失败:', error);
      toast({
        variant: "destructive",
        title: "刷新失败",
        description: "更新仪表盘数据时出现错误",
      });
      
      // 出错时也要重置加载状态
      setSalesData(prev => ({ ...prev, isLoading: false }));
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500); // 添加短暂延迟，让动画效果更明显
    }
  };

  // 只在组件挂载时获取一次数据
  useEffect(() => {
    const fetchData = async () => {
      // 先获取系统信息，包含当月收入数据
      await fetchSystemInfo();
      // 再获取销售统计数据用于图表显示
      await fetchSalesStatistics();
    };
    
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 格式化增长率显示
  const formatGrowthRate = (rate: number) => {
    const prefix = rate >= 0 ? '+' : ''
    return `${prefix}${rate.toFixed(2)}%`
  }

  // 获取增长率描述文本
  const getGrowthDescription = (rate: number) => {
    if (rate > 0) return '较上月增长'
    if (rate < 0) return '较上月下降'
    return '与上月持平'
  }

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header fixed>
        <Search placeholder="搜索..." />
        <div className='ml-auto flex items-center space-x-4'>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={refreshDashboard}
            disabled={isRefreshing || isLoading}
            className="h-9 w-9 rounded-full"
            title="刷新数据"
          >
            <IconRefresh className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">刷新数据</span>
          </Button>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-8'>
          <h2 className='text-3xl font-bold tracking-tight'>仪表盘</h2>
          <p className='text-muted-foreground'>
            系统概览及关键指标
          </p>
          </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <DashboardCard
            title="总用户数"
            value={isLoading ? '加载中...' : systemInfo?.total_users || 0}
            description="系统内注册的用户总数"
            icon={IconUsers}
            isRefreshing={isRefreshing}
          />
          <DashboardCard
            title="总课程数"
            value={isLoading ? '加载中...' : systemInfo?.total_courses || 0}
            description="系统内创建的课程总数"
            icon={IconBook2}
            isRefreshing={isRefreshing}
          />
          <DashboardCard
            title="总订单数"
            value={isLoading ? '加载中...' : systemInfo?.orders_count.total || 0}
            description={isLoading ? '加载中...' : `已支付: ${systemInfo?.orders_count.paid || 0}${systemInfo?.orders_count.pending ? ` | 待支付: ${systemInfo?.orders_count.pending}` : ''}${systemInfo?.orders_count.unpaid ? ` | 未支付: ${systemInfo?.orders_count.unpaid}` : ''}${systemInfo?.orders_count.cancelled ? ` | 已取消: ${systemInfo?.orders_count.cancelled}` : ''}${systemInfo?.orders_count.refunded ? ` | 已退款: ${systemInfo?.orders_count.refunded}` : ''}`}
            icon={IconShoppingCart}
            isRefreshing={isRefreshing}
          />
          <DashboardCard
            title="总收入"
            value={isLoading ? '加载中...' : `¥${systemInfo?.total_income.toFixed(2) || '0.00'}`}
            description="系统内产生的总收入"
            icon={IconChartBar}
            isRefreshing={isRefreshing}
          />
          <DashboardCard
            title="当月收入"
            value={isLoading ? '加载中...' : systemInfo ? `¥${systemInfo.current_month_income ? systemInfo.current_month_income.toFixed(2) : '0.00'}` : '加载中...'}
            description={isLoading ? '正在计算...' : systemInfo ? `${getGrowthDescription(salesData.growthRate)} ${formatGrowthRate(salesData.growthRate)}` : '正在计算...'}
            icon={IconTrendingUp}
            isRefreshing={isRefreshing}
          />
        </div>

        <motion.div 
          className='grid grid-cols-1 gap-4 lg:grid-cols-7 mt-4'
          animate={{ opacity: isRefreshing ? 0.8 : 1, y: isRefreshing ? 5 : 0 }}
          transition={{ duration: 0.3 }}
        >
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader>
              <CardTitle>销售分析</CardTitle>
                </CardHeader>
            <CardContent>
              <Overview 
                initialStatistics={salesData.salesStatistics} 
                ref={overviewRef}
              />
                </CardContent>
              </Card>
              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader>
              <CardTitle>登录日志</CardTitle>
                </CardHeader>
                <CardContent>
              <LoginLogs 
                autoLoad={false} 
                ref={loginLogsRef}
              />
                </CardContent>
              </Card>
        </motion.div>
      </Main>
    </>
  )
}