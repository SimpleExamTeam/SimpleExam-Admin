import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IconBrandWechat, IconCheck, IconX, IconLoader } from '@tabler/icons-react'
import { wechatAuthApi } from '@/lib/api'
import { isWeChatEnvironment } from '@/lib/wechat-utils'

type CallbackStatus = 'loading' | 'success' | 'error'

function WeChatQRCodeCallback() {
  const [status, setStatus] = useState<CallbackStatus>('loading')
  const [message, setMessage] = useState<string>('正在处理微信授权...')
  const [isInWeChatEnv, setIsInWeChatEnv] = useState<boolean>(false)

  const navigate = useNavigate()

  useEffect(() => {
    // 检测是否在微信环境中
    const inWeChatEnv = isWeChatEnvironment()
    setIsInWeChatEnv(inWeChatEnv)

    const handleWeChatCallback = async () => {
      try {
        // 直接从URL获取参数
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')

        if (!code) {
          setStatus('error')
          setMessage('授权失败：缺少授权码')
          return
        }

        if (!state) {
          setStatus('error')
          setMessage('授权失败：缺少状态参数')
          return
        }

        // 调用后端处理微信扫码回调
        const result = await wechatAuthApi.handleQRCodeCallback(code, state)

        if (result.code === 200) {
          if (inWeChatEnv) {
            // 在微信环境中，只显示成功提示，不进行实际登录
            setStatus('success')
            setMessage('扫码成功！请关闭当前页面')
          } else {
            // 在PC环境中，进行实际登录（这种情况通常不会发生，因为回调是从微信来的）
            const { token, user } = result.data

            if (token && user) {
              // 保存登录信息到localStorage，让PC端的轮询检测到
              localStorage.setItem('token', token)
              localStorage.setItem('user', JSON.stringify(user))

              setStatus('success')
              setMessage('登录成功，正在跳转...')

              // 延迟跳转
              setTimeout(() => {
                navigate({ to: '/' })
              }, 1500)
            } else {
              setStatus('error')
              setMessage('登录失败：服务器返回数据异常')
            }
          }
        } else {
          setStatus('error')
          setMessage(result.msg || '登录失败：授权验证失败')
        }
      } catch (error) {
        console.error('微信授权回调处理错误:', error)
        setStatus('error')
        setMessage('登录失败：网络错误或服务器异常')
      }
    }

    handleWeChatCallback()
  }, [navigate])

  const handleRetry = () => {
    navigate({ to: '/sign-in' })
  }

  const handleClose = () => {
    // 在微信环境中，尝试关闭当前页面
    if (isInWeChatEnv) {
      // 微信环境中关闭页面的方法
      const wxBridge = (window as any).WeixinJSBridge
      if (wxBridge) {
        wxBridge.call('closeWindow')
      } else {
        // 如果没有微信JS桥接，显示提示
        setMessage('请手动关闭当前页面')
      }
    }
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
            微信扫码登录
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

              {status === 'success' && !isInWeChatEnv && (
                <p className="text-sm text-muted-foreground mt-2">
                  即将跳转到管理后台
                </p>
              )}

              {status === 'success' && isInWeChatEnv && (
                <p className="text-sm text-muted-foreground mt-2">
                  PC端将自动完成登录，您可以关闭此页面
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
                <Button
                  onClick={handleRetry}
                  className="flex-1"
                >
                  返回登录
                </Button>
              </div>
            )}

            {status === 'success' && !isInWeChatEnv && (
              <div className="flex items-center justify-center">
                <div className="animate-pulse text-sm text-muted-foreground">
                  正在跳转...
                </div>
              </div>
            )}

            {status === 'success' && isInWeChatEnv && (
              <div className="flex space-x-2 w-full">
                <Button
                  onClick={handleClose}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  关闭页面
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/(auth)/wechat-qrcode-callback')({
  component: WeChatQRCodeCallback,
})
