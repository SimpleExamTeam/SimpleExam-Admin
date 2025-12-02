import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { IconArrowUp } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

interface ScrollToTopProps {
  /**
   * 触发显示按钮的滚动距离阈值（像素）
   */
  threshold?: number
  /**
   * 容器元素选择器，默认为 null（使用 window）
   */
  containerSelector?: string | null
  /**
   * 按钮位置的 CSS 类
   */
  className?: string
  /**
   * 按钮的z-index值，默认为50
   */
  zIndex?: number
}

export function ScrollToTop({
  threshold = 300,
  containerSelector = null,
  className,
  zIndex = 50
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false)

  // 处理滚动事件，显示/隐藏按钮
  useEffect(() => {
    let container: Window | Element | null = window;
    
    if (containerSelector) {
      container = document.querySelector(containerSelector);
      if (!container) {
        container = window;
      }
    }

    const handleScroll = () => {
      let scrollTop = 0;
      
      if (container === window) {
        scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      } else if (container instanceof Element) {
        scrollTop = container.scrollTop;
      }
      
      setIsVisible(scrollTop > threshold);
    }

    // 初始检查
    handleScroll();

    // 添加滚动监听
    container.addEventListener('scroll', handleScroll);
    
    // 确保在窗口大小变化时也检查滚动位置
    window.addEventListener('resize', handleScroll);

    // 清理
    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [containerSelector, threshold]);

  // 滚动到顶部
  const scrollToTop = () => {
    let container: Window | Element | null = window;
    
    if (containerSelector) {
      container = document.querySelector(containerSelector);
      if (!container) {
        container = window;
      }
    }

    if (container === window) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else if (container instanceof Element) {
      container.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={scrollToTop}
      className={cn(
        `fixed bottom-6 right-6 h-10 w-10 rounded-full shadow-lg transition-all duration-300`,
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none',
        className,
        zIndex === 50 ? 'z-50' : 'z-[100]'
      )}
      aria-label="返回顶部"
    >
      <IconArrowUp className="h-5 w-5" />
    </Button>
  )
} 