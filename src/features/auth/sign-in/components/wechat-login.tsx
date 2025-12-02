import { useState, useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { IconBrandWechat, IconRefresh, IconQrcode } from '@tabler/icons-react'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { wechatAuthApi } from '@/lib/api'
import { useAuth } from '@/context/auth-context'
import { 
  isWeChatEnvironment,  
  isMiniProgramEnvironment,
  getWeChatEnvironmentType 
} from '@/lib/wechat-utils'

interface WeChatLoginProps {
  onBack?: () => void
}

type QRCodeStatus = 'pending' | 'scanned' | 'confirmed' | 'expired'

export function WeChatLogin({ onBack }: WeChatLoginProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [qrCodeStatus, setQrCodeStatus] = useState<QRCodeStatus>('pending')
  const [statusMessage, setStatusMessage] = useState<string>('请使用微信扫描二维码')
  const [_sceneStr, setSceneStr] = useState<string>('')
  const [_qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  
  const { toast } = useToast()
  const navigate = useNavigate()
  const { login } = useAuth()

  const environmentType = getWeChatEnvironmentType()

  // 清理轮询
  const clearPolling = () => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current)
      pollingRef.current = null
    }
  }

  // 微信直接授权登录
  const handleDirectWeChatLogin = async () => {
    setIsLoading(true)
    try {
      const result = await wechatAuthApi.getOAuthUrl('ADMIN_STATE')
      
      if (result.code === 200 && result.data?.url) {
        // 直接跳转到微信授权页面
        window.location.href = result.data.url
      } else {
        toast({
          variant: "destructive",
          title: "获取授权链接失败",
          description: result.msg || "无法获取微信授权链接",
        })
      }
    } catch (error) {
      console.error('微信授权错误:', error)
      toast({
        variant: "destructive",
        title: "微信授权失败",
        description: "获取授权链接时发生错误",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 创建二维码
  const createQRCode = async () => {
    setIsLoading(true)
    try {
      const result = await wechatAuthApi.createQRCode()
      
      if (result.code === 200 && result.data) {
        const { scene_str, url } = result.data
        setSceneStr(scene_str)
        setQrCodeUrl(url)
        
        // 生成二维码图片
        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, url, {
            width: 200,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          })
        }
        
        setQrCodeStatus('pending')
        setStatusMessage('请使用微信扫描二维码')
        
        // 开始轮询状态
        startPolling(scene_str)
      } else {
        toast({
          variant: "destructive",
          title: "创建二维码失败",
          description: result.msg || "无法创建登录二维码",
        })
      }
    } catch (error) {
      console.error('创建二维码错误:', error)
      toast({
        variant: "destructive",
        title: "创建二维码失败",
        description: "创建二维码时发生错误",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 轮询检查二维码状态
  const startPolling = (scene_str: string) => {
    const checkStatus = async () => {
      try {
        const result = await wechatAuthApi.checkQRCodeStatus(scene_str)
        
        if (result.code === 200 && result.data) {
          const { status } = result.data
          setQrCodeStatus(status)
          
          switch (status) {
            case 'pending':
              setStatusMessage('请使用微信扫描二维码')
              pollingRef.current = setTimeout(checkStatus, 2000)
              break
            case 'scanned':
              setStatusMessage('已扫码，请在手机上确认')
              pollingRef.current = setTimeout(checkStatus, 1000)
              break
            case 'confirmed':
              setStatusMessage('登录成功')
              clearPolling()
              
              // 登录成功，保存token
              if (result.data.token && result.data.user) {
                login(result.data.token, result.data.user)
                
                toast({
                  variant: "success",
                  title: "登录成功",
                  description: "欢迎回来！",
                })
                
                navigate({ to: '/' })
              }
              break
            case 'expired':
              setStatusMessage('二维码已过期，请重新生成')
              clearPolling()
              break
          }
        }
      } catch (error) {
        console.error('检查二维码状态错误:', error)
        clearPolling()
        setStatusMessage('检查状态失败，请重新生成二维码')
      }
    }
    
    checkStatus()
  }

  // 重新生成二维码
  const refreshQRCode = () => {
    clearPolling()
    createQRCode()
  }

  // 组件挂载时的处理
  useEffect(() => {
    if (environmentType === 'browser') {
      // 非微信环境，创建二维码
      createQRCode()
    }
    
    // 组件卸载时清理轮询
    return () => {
      clearPolling()
    }
  }, [environmentType])

  // 如果在微信环境中，显示直接登录按钮
  if (isWeChatEnvironment()) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <IconBrandWechat className="h-6 w-6 text-green-500" />
            微信登录
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            {isMiniProgramEnvironment() ? '检测到微信小程序环境' : '检测到微信浏览器环境'}
          </div>
          
          <Button 
            onClick={handleDirectWeChatLogin}
            disabled={isLoading}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            <IconBrandWechat className="mr-2 h-4 w-4" />
            {isLoading ? '正在跳转...' : '微信授权登录'}
          </Button>
          
          {onBack && (
            <Button 
              variant="outline" 
              onClick={onBack}
              className="w-full"
            >
              返回
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  // 非微信环境，显示二维码登录
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <IconQrcode className="h-6 w-6" />
          微信扫码登录
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          {/* 二维码显示区域 */}
          <div className="relative">
            <canvas 
              ref={canvasRef}
              className={`border rounded-lg ${qrCodeStatus === 'expired' ? 'opacity-50' : ''}`}
            />
            {qrCodeStatus === 'expired' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <Button
                  onClick={refreshQRCode}
                  variant="secondary"
                  size="sm"
                  disabled={isLoading}
                >
                  <IconRefresh className="mr-2 h-4 w-4" />
                  重新生成
                </Button>
              </div>
            )}
          </div>
          
          {/* 状态信息 */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{statusMessage}</p>
            {qrCodeStatus === 'scanned' && (
              <div className="mt-2 flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                <span className="ml-2 text-sm text-green-600">等待确认中...</span>
              </div>
            )}
          </div>
          
          {/* 操作按钮 */}
          <div className="flex space-x-2 w-full">
            {qrCodeStatus !== 'expired' && (
              <Button
                onClick={refreshQRCode}
                variant="outline"
                disabled={isLoading}
                className="flex-1"
              >
                <IconRefresh className="mr-2 h-4 w-4" />
                刷新
              </Button>
            )}
            
            {onBack && (
              <Button 
                variant="outline" 
                onClick={onBack}
                className="flex-1"
              >
                返回
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
