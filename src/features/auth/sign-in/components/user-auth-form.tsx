import { HTMLAttributes, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { IconBrandWechat } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { useToast } from '@/components/ui/use-toast'
import { authApi, wechatAuthApi } from '@/lib/api'
import { useAuth } from '@/context/auth-context'
import { WeChatLogin } from './wechat-login'
import { isWeChatEnvironment } from '@/lib/wechat-utils'

type UserAuthFormProps = HTMLAttributes<HTMLFormElement>

const formSchema = z.object({
  username: z
    .string()
    .min(1, { message: '请输入用户名' }),
  password: z
    .string()
    .min(1, {
      message: '请输入密码',
    }),
})

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showWeChatLogin, setShowWeChatLogin] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const { login } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const result = await authApi.login(data.username, data.password)
      
      if (result.code === 200) {
        // 使用auth上下文管理登录状态
        login(result.data.token, result.data.user)
        
        toast({
          variant: "success",
          title: "登录成功",
          description: result.msg || "欢迎回来！",
        })
        
        // 重定向到仪表盘
        navigate({ to: '/' })
      } else {
        toast({
          variant: "destructive",
          title: "登录失败",
          description: result.msg || "用户名或密码错误",
        })
      }
    } catch (error) {
      console.error('登录错误:', error)
      toast({
        variant: "destructive",
        title: "登录失败",
        description: "登录过程中发生错误",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleWechatLogin = async () => {
    // 检测是否在微信环境中
    if (isWeChatEnvironment()) {
      // 微信环境中直接跳转到微信授权页面
      setIsLoading(true);
      try {
        const result = await wechatAuthApi.getOAuthUrl('ADMIN_STATE');

        if (result.code === 200 && result.data?.url) {
          // 直接跳转到微信授权页面
          window.location.href = result.data.url;
        } else {
          toast({
            variant: "destructive",
            title: "获取授权链接失败",
            description: result.msg || "无法获取微信授权链接",
          });
        }
      } catch (error) {
        console.error('微信授权错误:', error);
        toast({
          variant: "destructive",
          title: "微信授权失败",
          description: "获取授权链接时发生错误",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // 非微信环境，显示二维码登录
      setShowWeChatLogin(true);
    }
  };

  // 如果显示微信登录，渲染微信登录组件
  if (showWeChatLogin) {
    return (
      <WeChatLogin
        onBack={() => setShowWeChatLogin(false)}
      />
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>用户名</FormLabel>
              <FormControl>
                <Input placeholder='admin' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>密码</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='text-muted-foreground absolute -top-0.5 right-0 text-sm font-medium hover:opacity-75'
              >
                忘记密码?
              </Link>
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          登录
        </Button>

        <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background text-muted-foreground px-2'>
              或继续使用
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            variant='outline'
            type='button'
            disabled={isLoading}
            className="rounded-full p-3 h-auto w-auto hover:bg-green-50 hover:text-green-600 transition-colors"
            onClick={handleWechatLogin}
            title={isWeChatEnvironment() ? "微信直接登录" : "微信扫码登录"}
          >
            <IconBrandWechat className='h-8 w-8 text-green-500' />
          </Button>
        </div>
      </form>
    </Form>
  )
}
