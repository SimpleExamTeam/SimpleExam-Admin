import { useFeedback } from '../context/feedback-context'
import { FeedbackViewDialog } from './feedback-view-dialog'
import { FeedbackReplyDialog } from './feedback-reply-dialog'
import { FeedbackDeleteDialog } from './feedback-delete-dialog'

export function FeedbackDialogs() {
  const { open, currentFeedback } = useFeedback()

  // 只有当存在当前反馈时才渲染对话框
  if (!currentFeedback) return null

  return (
    <>
      {/* 查看反馈对话框 */}
      {open === 'view' && (
        <FeedbackViewDialog 
          open={open === 'view'} 
          currentFeedback={currentFeedback} 
        />
      )}

      {/* 回复反馈对话框 */}
      {open === 'reply' && (
        <FeedbackReplyDialog 
          open={open === 'reply'} 
          currentFeedback={currentFeedback} 
        />
      )}

      {/* 删除反馈对话框 */}
      {open === 'delete' && (
        <FeedbackDeleteDialog 
          open={open === 'delete'} 
          currentFeedback={currentFeedback} 
        />
      )}
    </>
  )
} 