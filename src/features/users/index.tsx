import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import UsersProvider, { useUsers } from './context/users-context'
import { Search } from '@/components/search'
import { User } from './data/schema'
import { ScrollToTop } from '@/components/scroll-to-top'

// 用户管理页面内容组件
function UsersContent() {
  const { 
    userList, 
    isLoading, 
    fetchUsers, 
    handleSearch, 
    currentPage, 
    pageSize, 
    handlePageChange, 
    handlePageSizeChange,
    resetSelectionRef,
    setOpen,
    setCurrentRow
  } = useUsers();

  // 处理查看用户详情
  const handleViewUser = (user: User) => {
    setCurrentRow(user);
    setOpen('view');
  };

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
            <h2 className='text-2xl font-bold tracking-tight'>用户管理</h2>
            <p className='text-muted-foreground'>
              在此管理用户及其角色。
            </p>
          </div>
          <UsersPrimaryButtons onRefresh={fetchUsers} />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {userList && (
            <UsersTable 
              data={userList.items} 
              columns={columns} 
              isLoading={isLoading}
              pageCount={Math.ceil(userList.total / pageSize)}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onSearch={handleSearch}
              onResetSelection={(resetFn) => resetSelectionRef.current = resetFn}
              onViewUser={handleViewUser}
            />
          )}
        </div>
      </Main>

      <UsersDialogs />
      
      {/* 添加返回顶部按钮 */}
      <ScrollToTop zIndex={100} />
    </>
  )
}

// 主页面组件，提供上下文
export default function Users() {
  return (
    <UsersProvider>
      <UsersContent />
    </UsersProvider>
  )
}
