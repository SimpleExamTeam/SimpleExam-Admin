import React, { createContext, useContext, useState, useCallback } from 'react';

// 订单搜索参数接口
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

// 订单上下文接口
interface OrdersContextType {
  searchParams: OrderSearchParams;
  handleSearch: (params: OrderSearchParams) => void;
  clearSearch: () => void;
}

// 创建上下文
const OrdersContext = createContext<OrdersContextType | null>(null);

// 提供者组件
export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [searchParams, setSearchParams] = useState<OrderSearchParams>({
    page: 1,
  });

  // 处理搜索
  const handleSearch = useCallback((params: OrderSearchParams) => {
    // 创建一个新的搜索参数对象，只包含有值的参数
    const newParams: OrderSearchParams = { page: 1, ...params }; // 重置页码并合并新参数
    
    // 保存搜索参数
    setSearchParams(newParams);
  }, []);

  // 清除搜索
  const clearSearch = useCallback(() => {
    setSearchParams({ page: 1 });
  }, []);

  // 上下文值
  const contextValue: OrdersContextType = {
    searchParams,
    handleSearch,
    clearSearch,
  };

  return (
    <OrdersContext.Provider value={contextValue}>
      {children}
    </OrdersContext.Provider>
  );
}

// 自定义钩子
export function useOrdersContext() {
  const context = useContext(OrdersContext);
  return context;
} 