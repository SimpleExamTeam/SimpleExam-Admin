import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SaleRecord {
  id: number;
  customer: {
    name: string;
    email: string;
    avatar?: string;
    initials: string;
  };
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

// 模拟数据
const recentSalesData: SaleRecord[] = [
  {
    id: 1,
    customer: {
      name: '张三',
      email: 'zhangsan@example.com',
      initials: 'ZS',
    },
    amount: 1999,
    status: 'completed',
    date: '2023-04-01'
  },
  {
    id: 2,
    customer: {
      name: '李四',
      email: 'lisi@example.com',
      initials: 'LS',
    },
    amount: 3999,
    status: 'completed',
    date: '2023-04-02'
  },
  {
    id: 3,
    customer: {
      name: '王五',
      email: 'wangwu@example.com',
      initials: 'WW',
    },
    amount: 2499,
    status: 'completed',
    date: '2023-04-03'
  },
  {
    id: 4,
    customer: {
      name: '赵六',
      email: 'zhaoliu@example.com',
      initials: 'ZL',
    },
    amount: 999,
    status: 'completed',
    date: '2023-04-04'
  },
  {
    id: 5,
    customer: {
      name: '钱七',
      email: 'qianqi@example.com',
      initials: 'QQ',
    },
    amount: 4999,
    status: 'completed',
    date: '2023-04-05'
  }
]

// 格式化金额
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function RecentSales() {
  return (
    <div className="space-y-8">
      {recentSalesData.map((sale) => (
        <div key={sale.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            {sale.customer.avatar && (
              <AvatarImage src={sale.customer.avatar} alt={sale.customer.name} />
            )}
            <AvatarFallback>{sale.customer.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.customer.name}</p>
            <p className="text-sm text-muted-foreground">{sale.customer.email}</p>
          </div>
          <div className="ml-auto font-medium">
            {formatCurrency(sale.amount)}
          </div>
        </div>
      ))}
    </div>
  )
} 