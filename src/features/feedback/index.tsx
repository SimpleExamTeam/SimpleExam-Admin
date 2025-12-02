import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Search } from '@/components/search'
import { createColumns } from './components/feedback-columns'
import { FeedbackTable } from './components/feedback-table'
import { FeedbackDialogs } from './components/feedback-dialogs'
import { FeedbackPrimaryButtons } from './components/feedback-primary-buttons'
import FeedbackProvider, { useFeedback } from './context/feedback-context'
import type { Feedback as FeedbackType } from './data/schema'
import { ScrollToTop } from '@/components/scroll-to-top'

// 反馈管理页面内容组件
function FeedbackContent() {
  const { 
    feedbackList, 
    isLoading, 
    fetchFeedbacks, 
    handleSearch, 
    currentPage, 
    pageSize, 
    handlePageChange, 
    handlePageSizeChange,
    resetSelectionRef,
    setOpen,
    setCurrentFeedback,
    statusFilter,
    handleStatusChange,
    dateRange,
    handleDateRangeChange
  } = useFeedback();

  // 处理查看反馈详情
  const handleViewFeedback = (feedback: FeedbackType) => {
    setCurrentFeedback(feedback);
    setOpen('view');
  };

  // 处理回复反馈
  const handleReplyFeedback = (feedback: FeedbackType) => {
    setCurrentFeedback(feedback);
    setOpen('reply');
  };

  // 处理删除反馈
  const handleDeleteFeedback = (feedback: FeedbackType) => {
    setCurrentFeedback(feedback);
    setOpen('delete');
  };

  // 创建表格列定义
  const feedbackColumns = createColumns({
    onView: handleViewFeedback,
    onReply: handleReplyFeedback,
    onDelete: handleDeleteFeedback
  });

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
            <h2 className='text-2xl font-bold tracking-tight'>用户反馈</h2>
            <p className='text-muted-foreground'>
              查看和回复用户反馈信息
            </p>
          </div>
          <FeedbackPrimaryButtons onRefresh={fetchFeedbacks} />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {feedbackList && (
            <FeedbackTable 
              data={feedbackList.items} 
              columns={feedbackColumns} 
              isLoading={isLoading}
              pageCount={Math.ceil(feedbackList.total / pageSize)}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onSearch={handleSearch}
              onStatusChange={handleStatusChange}
              onDateRangeChange={handleDateRangeChange}
              onResetSelection={(resetFn) => resetSelectionRef.current = resetFn}
              onViewFeedback={handleViewFeedback}
              statusFilter={statusFilter}
              dateRange={dateRange}
            />
          )}
        </div>
      </Main>

      <FeedbackDialogs />
      
      {/* 添加返回顶部按钮 */}
      <ScrollToTop zIndex={100} />
    </>
  )
}

// 主页面组件，提供上下文
export default function Feedback() {
  return (
    <FeedbackProvider>
      <FeedbackContent />
    </FeedbackProvider>
  )
}