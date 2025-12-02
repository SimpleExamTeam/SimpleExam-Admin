import React, { useState, useRef } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { User, UserList, userListSchema } from '../data/schema'
import { usersApi, useDeduplicatedEffect } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'

type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete' | 'view'

// 可选的每页数据条数
export const PAGE_SIZE_OPTIONS = [10, 50, 100, 200] as const;
export type PageSizeOption = typeof PAGE_SIZE_OPTIONS[number];

interface UsersContextType {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: User | null
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>
  fetchUsers: () => Promise<void>
  userList: UserList | null
  isLoading: boolean
  currentPage: number
  pageSize: PageSizeOption
  handlePageChange: (page: number) => void
  handlePageSizeChange: (size: PageSizeOption) => void
  handleSearch: (value: string) => void
  handleRefresh: () => Promise<void>
  pageSizeOptions: readonly number[]
  resetSelectionRef: React.MutableRefObject<(() => void) | null>
}

const UsersContext = React.createContext<UsersContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function UsersProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<User | null>(null)
  const [userList, setUserList] = useState<UserList | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSizeOption>(10)
  const { toast } = useToast()
  const resetSelectionRef = useRef<(() => void) | null>(null)

  // 获取用户列表的方法
  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await usersApi.getUsers({
        page: currentPage,
        size: pageSize,
        keyword: searchKeyword || undefined,
      }) as any
      
      if (response.code === 200) {
        // 确保即使API返回null也能正确处理
        const adaptedData = {
          items: response.data?.items || [],
          total: response.data?.total || 0
        }
        
        const parsedData = userListSchema.parse(adaptedData)
        setUserList(parsedData)
      } else {
        toast({
          variant: "destructive",
          title: "获取用户失败",
          description: response.msg || response.message || "加载用户列表时出现错误",
        })
      }
    } catch (error) {
      console.error('获取用户错误:', error)
      toast({
        variant: "destructive",
        title: "获取用户失败",
        description: "加载用户列表时出现错误",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 使用去重效果钩子替换原有的useEffect
  useDeduplicatedEffect(() => {
    fetchUsers()
  }, [currentPage, pageSize, searchKeyword], { dedupTime: 300 })

  // 设置搜索关键词
  const handleSearch = (value: string) => {
    setSearchKeyword(value)
    setCurrentPage(1) // 搜索时重置到第一页
  }

  // 处理页码变化
  const handlePageChange = (page: number) => {
    console.log("切换到页码:", page);
    setCurrentPage(page);
  };

  // 处理每页条数变化
  const handlePageSizeChange = (size: PageSizeOption) => {
    setPageSize(size);
    setCurrentPage(1); // 改变每页条数时重置到第一页
  };

  // 处理刷新按钮点击
  const handleRefresh = async () => {
    // 重置筛选状态
    setSearchKeyword('');
    // 重置页码
    setCurrentPage(1);
    // 触发行选择重置
    if (resetSelectionRef.current) {
      resetSelectionRef.current();
    }
    // 刷新数据
    await fetchUsers();
  };

  return (
    <UsersContext.Provider value={{ 
      open, 
      setOpen, 
      currentRow, 
      setCurrentRow, 
      fetchUsers,
      userList,
      isLoading,
      currentPage,
      pageSize,
      handlePageChange,
      handlePageSizeChange,
      handleSearch,
      handleRefresh,
      pageSizeOptions: PAGE_SIZE_OPTIONS,
      resetSelectionRef
    }}>
      {children}
    </UsersContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUsers = () => {
  const usersContext = React.useContext(UsersContext)

  if (!usersContext) {
    throw new Error('useUsers has to be used within <UsersContext>')
  }

  return usersContext
}
