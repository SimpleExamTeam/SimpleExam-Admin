import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { IconAlertCircle, IconCheck, IconInfoCircle } from "@tabler/icons-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, variant, action, ...props }) {
        // 根据变体选择图标
        let Icon = IconCheck // 默认使用绿色对勾图标
        if (variant === "destructive") {
          Icon = IconAlertCircle
        } else if (variant === "info") {
          Icon = IconInfoCircle
        }

        return (
          <Toast key={id} variant={variant} {...props}>
            <Icon className="h-5 w-5 shrink-0" />
            <div className="flex-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
} 