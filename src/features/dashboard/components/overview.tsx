import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from 'recharts'
import { format, startOfYear, endOfYear, subDays, subYears, startOfDay, endOfDay } from 'date-fns'
import { systemApi } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'
import { useTheme } from '@/context/theme-context'

// 维度选项
const DIMENSION_OPTIONS = [
  { value: "day", label: '最近一周' },
  { value: "month", label: '月度' },
  { value: "year", label: '年度' },
]

interface TimeData {
  time_point: string;
  sales: number;
  orders: number;
}

interface SalesStatistics {
  total_sales: number;
  total_orders: number;
  time_data: TimeData[];
}

interface OverviewProps {
  initialStatistics?: SalesStatistics | null;
}

// 导出组件引用类型
export interface OverviewRef {
  refreshData: () => void;
  getLatestStatistics: () => SalesStatistics | null;
}

export const Overview = forwardRef<OverviewRef, OverviewProps>(({ initialStatistics }, ref) => {
  const [dimension, setDimension] = useState<'day' | 'month' | 'year'>('day')
  const [statistics, setStatistics] = useState<SalesStatistics | null>(initialStatistics || null)
  const [isLoading, setIsLoading] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay(subDays(new Date(), 6)), // 今天 + 前6天 = 7天
    to: endOfDay(new Date())
  })
  const { toast } = useToast()
  const { theme } = useTheme()
  
  // 使用ref跟踪是否是用户手动触发的操作
  const isUserAction = useRef(false);
  const requestInProgress = useRef(false);
  
  // 获取轴线颜色，根据主题自适应
  const getAxisColor = () => {
    return theme === 'dark' ? 'rgba(255, 255, 255, 0.65)' : '#888888'
  }
  
  // 获取标签颜色，根据主题自适应
  const getLabelColor = () => {
    return theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : '#333333'
  }
  
  // 格式化销售额显示
  const formatSalesValue = (value: number) => {
    if (value >= 1000) {
      return `¥${(value / 1000).toFixed(1)}k`
    }
    return `¥${value.toFixed(0)}`
  }
  
  // 格式化图表数据
  const formatChartData = (data: TimeData[]) => {
    return data.map(item => ({
      name: formatTimePoint(item.time_point, dimension),
      sales: item.sales,
      orders: item.orders
    }))
  }
  
  // 根据维度格式化时间点显示
  const formatTimePoint = (timePoint: string, dimension: string) => {
    try {
      switch (dimension) {
        case 'day':
          // 将 2025-05-15 格式化为 5/15
          const dateParts = timePoint.split('-');
          if (dateParts.length >= 3) {
            const month = parseInt(dateParts[1]);
            const day = parseInt(dateParts[2]);
            return `${month}/${day}`;
          }
          return timePoint;
        case 'month':
          // 将 2025-05 格式化为 5月
          const monthParts = timePoint.split('-');
          if (monthParts.length >= 2) {
            const month = parseInt(monthParts[1]);
            return `${month}月`;
          }
          return timePoint;
        case 'year':
          // 年份保持不变
          return timePoint;
        default:
          return timePoint;
      }
    } catch (error) {
      console.error('格式化时间点出错:', error, timePoint, dimension);
      return timePoint; // 返回原始值作为后备
    }
  }

  // 获取销售统计数据
  const fetchSalesStatistics = async (forceRefresh = false) => {
    // 如果不是用户手动触发的操作且不是强制刷新，不发起请求
    if (!isUserAction.current && !forceRefresh) {
      return;
    }
    
    // 防止重复请求
    if (requestInProgress.current) {
      return;
    }
    
    // 确保日期存在
    if (!dateRange?.from) {
      toast({
        variant: "destructive",
        title: "日期范围无效",
        description: "请选择有效的日期范围",
      })
      return;
    }

    try {
      requestInProgress.current = true;
      setIsLoading(true);
      
      const startTime = format(dateRange.from, 'yyyy-MM-dd 00:00:00')
      const endTime = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd 23:59:59') : format(dateRange.from, 'yyyy-MM-dd 23:59:59')
      
      console.log('Overview组件请求数据:', {dimension, startTime, endTime, forceRefresh});
      
      const response = await systemApi.getSalesStatistics({
        dimension,
        start_time: startTime,
        end_time: endTime
      })
      
      if (response.code === 200 && response.data?.statistics) {
        setStatistics(response.data.statistics)
      } else {
        toast({
          variant: "destructive",
          title: "获取销售统计数据失败",
          description: response.msg || "请求处理失败",
        })
      }
    } catch (error) {
      console.error('获取销售统计数据失败:', error)
      toast({
        variant: "destructive",
        title: "获取销售统计数据失败",
        description: "加载销售统计数据时出现错误",
      })
    } finally {
      setIsLoading(false)
      requestInProgress.current = false;
      // 重置用户操作标志
      isUserAction.current = false;
    }
  }
  
  // 暴露刷新方法给父组件
  useImperativeHandle(ref, () => ({
    refreshData: () => {
      fetchSalesStatistics(true);
    },
    getLatestStatistics: () => {
      return statistics;
    }
  }));

  // 处理维度变更 - 用户手动操作
  const handleDimensionChange = (value: string) => {
    // 标记为用户手动操作
    isUserAction.current = true;
    
    const newDimension = value as 'day' | 'month' | 'year'
    setDimension(newDimension)
    
    // 根据维度自动调整日期范围
    const now = new Date()
    let newDateRange: DateRange | undefined
    
    switch (newDimension) {
      case 'day':
        // 日维度：最近7天
        newDateRange = {
          from: startOfDay(subDays(now, 6)), // 今天 + 前6天 = 7天
          to: endOfDay(now)
        }
        break
      case 'month':
        // 月维度：本年度所有月份
        newDateRange = {
          from: startOfYear(now),
          to: endOfYear(now)
        }
        break
      case 'year':
        // 年维度：最近3年
        newDateRange = {
          from: startOfYear(subYears(now, 2)), // 今年 + 前2年 = 3年
          to: endOfYear(now)
        }
        break
    }
    
    setDateRange(newDateRange)
  }

  // 处理日期范围变更 - 用户手动操作
  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    // 标记为用户手动操作
    isUserAction.current = true;
    setDateRange(newDateRange)
  }

  // 当维度或日期范围变化时，如果是用户手动操作，则获取新数据
  useEffect(() => {
    fetchSalesStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimension, dateRange]);

  // 组件挂载时触发一次数据获取
  useEffect(() => {
    // 初始加载时强制获取数据
    fetchSalesStatistics(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 当initialStatistics变化时更新状态
  useEffect(() => {
    if (initialStatistics) {
      setStatistics(initialStatistics);
    }
  }, [initialStatistics]);

  // 根据维度生成标题文本
  const getDateRangeTitle = () => {
    if (!dateRange?.from) return '';
    
    const fromDate = format(dateRange.from, 'yyyy-MM-dd');
    const toDate = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : fromDate;
    
    switch (dimension) {
      case 'day':
        // 计算日期差，单位为天
        const fromDay = dateRange.from;
        const toDay = dateRange.to || dateRange.from;
        // 修正天数计算逻辑
        const diffTime = toDay.getTime() - fromDay.getTime();
        const diffInDays = Math.floor(diffTime / (24 * 60 * 60 * 1000)) + 1;
        
        if (diffInDays === 7) {
          return `最近7天数据`;
        } else {
          return `${diffInDays}天数据 (${format(fromDay, 'MM/dd')} 至 ${format(toDay, 'MM/dd')})`;
        }
      case 'month':
        const fromYear = parseInt(format(dateRange.from, 'yyyy'));
        const toYear = dateRange.to ? parseInt(format(dateRange.to, 'yyyy')) : fromYear;
        
        // 获取月份
        const fromMonth = parseInt(format(dateRange.from, 'MM'));
        const toMonth = dateRange.to ? parseInt(format(dateRange.to, 'MM')) : fromMonth;
        
        // 计算月份跨度
        const totalMonths = (toYear - fromYear) * 12 + toMonth - fromMonth + 1;
        
        // 根据是否跨年和月份跨度显示不同的描述
        if (fromYear === toYear) {
          if (totalMonths === 12) {
            return `${fromYear}年度月度数据`;
          } else if (totalMonths === 1) {
            return `${fromYear}年${fromMonth}月数据`;
          } else {
            return `${fromYear}年${fromMonth}月至${toMonth}月数据 (${totalMonths}个月)`;
          }
        } else {
          return `${fromYear}年${fromMonth}月至${toYear}年${toMonth}月数据 (${totalMonths}个月)`;
        }
      case 'year':
        // 计算实际年份差
        const fromYearVal = parseInt(format(dateRange.from, 'yyyy'));
        const toYearVal = dateRange.to ? parseInt(format(dateRange.to, 'yyyy')) : fromYearVal;
        const yearDiff = toYearVal - fromYearVal + 1;
        
        // 根据实际选择的年份范围动态显示
        if (yearDiff === 1) {
          return `${fromYearVal}年数据`;
        } else {
          return `${yearDiff}年数据 (${fromYearVal} 至 ${toYearVal})`;
        }
      default:
        return `${fromDate} 至 ${toDate}`;
    }
  };

  if (isLoading) {
    return <Skeleton className="w-full h-[350px]" />
  }

  // 如果没有数据，显示空状态
  if (!statistics || !statistics.time_data || statistics.time_data.length === 0) {
    return (
      <div className="flex flex-col h-[350px]">
        <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:justify-between md:items-center mb-4 flex-wrap gap-2">
          <div className="text-sm text-muted-foreground pl-2">
            <div>暂无数据</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div>
              <Select value={dimension} onValueChange={handleDimensionChange}>
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue placeholder="维度" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  sideOffset={4}
                  className="z-[999] w-[120px]"
                >
                  <SelectGroup>
                    {DIMENSION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[280px]">
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
                placeholder="选择日期范围"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center flex-1 text-muted-foreground">
          暂无销售数据
        </div>
      </div>
    )
  }

  // 此时statistics已确认不为null，可以安全使用
  const chartData = formatChartData(statistics.time_data)
  const axisColor = getAxisColor()
  const labelColor = getLabelColor()

  return (
    <div className="flex flex-col h-[350px]">
      <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:justify-between md:items-center mb-4 flex-wrap gap-2">
        <div className="text-sm text-muted-foreground pl-2">
          <div>{getDateRangeTitle()}</div>
          <div className="mt-1">总销售额: ¥{statistics.total_sales.toFixed(2)} | 总订单数: {statistics.total_orders}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div>
            <Select value={dimension} onValueChange={handleDimensionChange}>
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue placeholder="维度" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                sideOffset={4}
                className="z-[999] w-[120px]"
              >
                <SelectGroup>
                  {DIMENSION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="w-[250px]">
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={handleDateRangeChange}
              placeholder="选择日期范围"
            />
          </div>
        </div>
      </div>
      <br />
      <div className="flex-1 h-full pt-5">
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke={theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} 
            />
        <XAxis
          dataKey='name'
              stroke={axisColor}
          fontSize={12}
          tickLine={false}
          axisLine={false}
              tick={{ fill: axisColor }}
        />
        <YAxis
              stroke={axisColor}
          fontSize={12}
          tickLine={false}
          axisLine={false}
              tick={{ fill: axisColor }}
              tickFormatter={(value) => `¥${value}`}
            />
            <Tooltip 
              formatter={(value: number) => [`¥${value.toFixed(2)}`, '销售额']}
              labelFormatter={(label) => `${label}`}
              contentStyle={{ 
                backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', 
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' 
              }}
              labelStyle={{ color: theme === 'dark' ? '#e5e7eb' : '#111827' }}
              itemStyle={{ color: theme === 'dark' ? '#e5e7eb' : '#111827' }}
        />
        <Bar
              dataKey='sales'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
              maxBarSize={60}
            >
              <LabelList 
                dataKey="sales" 
                position="top" 
                formatter={formatSalesValue}
                style={{ 
                  fill: labelColor,
                  fontSize: 12,
                  fontWeight: 500
                }}
                offset={5}
              />
            </Bar>
      </BarChart>
    </ResponsiveContainer>
      </div>
    </div>
  )
})
