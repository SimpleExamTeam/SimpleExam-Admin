import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IconBrandWechat, IconCheck, IconX, IconLoader } from '@tabler/icons-react'
import { wechatAuthApi, authApi } from '@/lib/api'
import { useAuth } from '@/context/auth-context'
import { useToast } from '@/components/ui/use-toast'

type CallbackStatus = 'loading' | 'success' | 'error'

function WeChatCallback() {
  const [status, setStatus] = useState<CallbackStatus>('loading')
  const [message, setMessage] = useState<string>('正在处理微信授权...')
  const [hasProcessed, setHasProcessed] = useState<boolean>(false)

  const navigate = useNavigate()
  const { login } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    // 防止重复处理
    if (hasProcessed) return

    const handleWeChatCallback = async () => {
      try {
        setHasProcessed(true)

        // 直接从URL获取参数
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')

        if (!code) {
          setStatus('error')
          setMessage('授权失败：缺少授权码')
          return
        }

        // 调用后端处理微信网页授权回调
        const result = await wechatAuthApi.handleOAuthCallback(code, state || undefined)

        if (result.code === 200 && result.data) {
          const { token, user } = result.data

          if (token && user) {
            // 登录成功
            login(token, user)

            setStatus('success')
            setMessage('登录成功，正在跳转...')

            toast({
              variant: "success",
              title: "微信登录成功",
              description: "欢迎回来！",
            })

            // 延迟跳转，让用户看到成功信息
            setTimeout(() => {
              navigate({ to: '/' })
            }, 1500)
          } else {
            setStatus('error')
            setMessage('登录失败：服务器返回数据异常')
          }
        } else {
          // 检查是否是code已使用的错误，但实际登录可能已成功
          const errorMsg = result.msg || ''
          if (errorMsg.includes('code been used') || errorMsg.includes('已使用')) {
            // code已使用，尝试检查当前登录状态
            try {
              setMessage('检查登录状态...')
              const tokenCheckResult = await authApi.checkToken()

              if (tokenCheckResult.code === 200 && tokenCheckResult.data) {
                // token有效，说明实际已经登录成功
                const { user } = tokenCheckResult.data
                const existingToken = localStorage.getItem('token')

                if (existingToken && user) {
                  login(existingToken, user)

                  setStatus('success')
                  setMessage('登录成功，正在跳转...')

                  toast({
                    variant: "success",
                    title: "微信登录成功",
                    description: "欢迎回来！",
                  })

                  setTimeout(() => {
                    navigate({ to: '/' })
                  }, 1500)
                  return
                }
              }
            } catch (_e) {
              // token检查失败，继续处理
            }

            // 检查本地存储的登录信息
            const existingToken = localStorage.getItem('token')
            const existingUser = localStorage.getItem('user')

            if (existingToken && existingUser) {
              try {
                const user = JSON.parse(existingUser)
                login(existingToken, user)

                setStatus('success')
                setMessage('登录成功，正在跳转...')

                toast({
                  variant: "success",
                  title: "微信登录成功",
                  description: "欢迎回来！",
                })

                setTimeout(() => {
                  navigate({ to: '/' })
                }, 1500)
                return
              } catch (_e) {
                // 解析用户信息失败，继续显示错误
              }
            }

            // 如果没有本地登录信息，显示特殊提示
            setStatus('error')
            setMessage('授权码已使用，如果您已登录成功，请直接访问管理后台')

            // 不显示错误toast，因为可能实际已经成功了
          } else {
            setStatus('error')
            setMessage(result.msg || '登录失败：授权验证失败')

            toast({
              variant: "destructive",
              title: "微信登录失败",
              description: result.msg || "授权验证失败",
            })
          }
        }
      } catch (_error) {
        setStatus('error')
        setMessage('登录失败：网络错误或服务器异常')

        toast({
          variant: "destructive",
          title: "微信登录失败",
          description: "网络错误或服务器异常",
        })
      }
    }

    handleWeChatCallback()
  }, [hasProcessed, login, navigate, toast])

  const handleRetry = () => {
    navigate({ to: '/sign-in' })
  }

  const handleGoToAdmin = () => {
    navigate({ to: '/' })
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <IconLoader className="h-12 w-12 text-blue-500 animate-spin" />
      case 'success':
        return <IconCheck className="h-12 w-12 text-green-500" />
      case 'error':
        return <IconX className="h-12 w-12 text-red-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600'
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <IconBrandWechat className="h-6 w-6 text-green-500" />
            微信登录
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            {/* 状态图标 */}
            <div className="flex items-center justify-center">
              {getStatusIcon()}
            </div>
            
            {/* 状态消息 */}
            <div className="text-center">
              <p className={`text-lg font-medium ${getStatusColor()}`}>
                {message}
              </p>
              
              {status === 'loading' && (
                <p className="text-sm text-muted-foreground mt-2">
                  请稍候，正在验证您的身份...
                </p>
              )}
              
              {status === 'success' && (
                <p className="text-sm text-muted-foreground mt-2">
                  即将跳转到管理后台
                </p>
              )}
              
              {status === 'error' && (
                <p className="text-sm text-muted-foreground mt-2">
                  请检查您的网络连接或重试
                </p>
              )}
            </div>
            
            {/* 操作按钮 */}
            {status === 'error' && (
              <div className="flex space-x-2 w-full">
                {message.includes('授权码已使用') ? (
                  <>
                    <Button
                      onClick={handleGoToAdmin}
                      className="flex-1 bg-green-500 hover:bg-green-600"
                    >
                      前往管理后台
                    </Button>
                    <Button
                      onClick={handleRetry}
                      variant="outline"
                      className="flex-1"
                    >
                      重新登录
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleRetry}
                    className="flex-1"
                  >
                    返回登录
                  </Button>
                )}
              </div>
            )}
            
            {status === 'success' && (
              <div className="flex items-center justify-center">
                <div className="animate-pulse text-sm text-muted-foreground">
                  正在跳转...
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/(auth)/wechat-callback')({
  component: WeChatCallback,
})
