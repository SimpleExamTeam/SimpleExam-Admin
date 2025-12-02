import { Button } from '@/components/ui/button'
import { IconRefresh } from '@tabler/icons-react'
import { useFeedback } from '../context/feedback-context'

interface Props {
  onRefresh?: () => Promise<void>
}

export function FeedbackPrimaryButtons({ onRefresh }: Props) {
  const { handleRefresh } = useFeedback()

  // 处理刷新按钮点击
  const handleRefreshClick = async () => {
    if (onRefresh) {
      await onRefresh()
    } else if (handleRefresh) {
      await handleRefresh()
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="outline" 
        className="space-x-1" 
        onClick={handleRefreshClick}
      >
        <span>刷新</span>
        <IconRefresh size={18} />
      </Button>
    </div>
  )
} 