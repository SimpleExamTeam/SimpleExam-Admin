import { useToast } from "@/components/ui/use-toast"

interface ApiResponse {
  code: number;
  msg: string;
  data?: any;
}

/**
 * 处理 API 响应，根据响应状态显示 toast 消息
 * @param response API 响应对象
 * @param options 配置选项
 * @returns 处理后的响应对象
 */
export function handleApiResponse(
  response: ApiResponse, 
  options?: {
    successTitle?: string;
    successMsg?: string;
    showSuccessToast?: boolean;
  }
) {
  const { toast } = useToast()
  const { 
    successTitle = "操作成功", 
    successMsg,
    showSuccessToast = false 
  } = options || {}

  if (response.code === 200) {
    if (showSuccessToast) {
      toast({
        variant: "success",
        title: successTitle,
        description: successMsg || response.msg || "操作已成功完成",
      })
    }
    return {
      success: true,
      data: response.data,
      message: response.msg
    }
  } else {
    toast({
      variant: "destructive",
      title: "操作失败",
      description: response.msg || "请求处理失败",
    })
    return {
      success: false,
      message: response.msg,
      code: response.code
    }
  }
}

/**
 * 处理 API 错误
 * @param error 错误对象
 * @param fallbackMsg 默认错误消息
 */
export function handleApiError(error: unknown, fallbackMsg = "请求处理过程中发生错误") {
  const { toast } = useToast()
  
  console.error("API Error:", error)
  
  let errorMsg = fallbackMsg
  
  // 尝试从错误对象中提取消息
  if (error && typeof error === 'object' && 'message' in error) {
    errorMsg = String(error.message)
  }
  
  toast({
    variant: "destructive",
    title: "请求错误",
    description: errorMsg,
  })
  
  return {
    success: false,
    message: errorMsg
  }
} 