// @ts-nocheck
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import { systemApi } from '@/lib/api'
import { useAuth } from '@/context/auth-context'
import { saveAuth } from '@/utils/auth'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// 创建自定义事件，用于通知用户信息更新
export const USER_PROFILE_UPDATED_EVENT = 'user-profile-updated';

// 发布用户信息更新事件
export function notifyUserProfileUpdated(userData: any) {
  const event = new CustomEvent(USER_PROFILE_UPDATED_EVENT, { 
    detail: userData,
    bubbles: true 
  });
  window.dispatchEvent(event);
  
  // 同时触发一个storage事件的模拟，以便其他组件可以监听到
  const storageEvent = new StorageEvent('storage', {
    key: 'user',
    newValue: JSON.stringify(userData),
    storageArea: localStorage
  });
  window.dispatchEvent(storageEvent);
}

// 定义用户数据结构
interface UserData {
  avatar: string;
  id: number;
  nickname: string;
  username: string;
  sex?: number;
  country?: string;
  province?: string;
  city?: string;
  is_admin?: boolean;
  created_at?: string;
}

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: '用户名至少需要2个字符。',
    })
    .max(30, {
      message: '用户名不能超过30个字符。',
    }),
  nickname: z
    .string()
    .min(2, {
      message: '昵称至少需要2个字符。',
    })
    .max(30, {
      message: '昵称不能超过30个字符。',
    }),
  avatar: z
    .string()
    .url({
      message: '请输入有效的头像URL。',
    }),
  sex: z.number().default(0),
  country: z.string().default(''),
  province: z.string().default(''),
  city: z.string().default(''),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // 如果没有输入密码，则不需要确认密码
  if (!data.password) return true;
  // 如果输入了密码，则确认密码必须匹配
  return data.password === data.confirmPassword;
}, {
  message: "两次输入的密码不匹配",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfileForm() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user: authUser, login } = useAuth();

  // 从API获取用户数据
  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const response = await systemApi.getProfile();
      
      if (response && response.code === 200) {
        setUserData(response.data);
      } else {
        toast({
          variant: "destructive",
          title: "获取个人资料失败",
          description: response?.msg || "无法加载个人资料，请稍后再试。",
        });
      }
    } catch (error) {
      console.error('获取个人资料失败:', error);
      toast({
        variant: "destructive",
        title: "获取个人资料失败",
        description: "无法加载个人资料，请稍后再试。",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 组件加载时获取用户数据
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // 设置表单默认值
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: '',
      nickname: '',
      avatar: '',
      sex: 0,
      country: '',
      province: '',
      city: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  // 当用户数据加载后更新表单
  useEffect(() => {
    if (userData) {
      form.reset({
        username: userData.username,
        nickname: userData.nickname,
        avatar: userData.avatar,
        sex: userData.sex || 0,
        country: userData.country || '',
        province: userData.province || '',
        city: userData.city || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [userData, form]);

  // 提交表单
  const onSubmit = async (data: ProfileFormValues) => {
    if (!userData) return;
    
    setIsSubmitting(true);
    
    try {
      // 准备请求数据，只包含需要更新的字段
      const updateData: any = {
        nickname: data.nickname,
        avatar: data.avatar,
        sex: typeof data.sex === 'string' ? parseInt(data.sex as string) : data.sex,
      };
      
      // 如果提供了密码，则添加到请求中
      if (data.password) {
        updateData.password = data.password;
      }
      
      // 调用API更新用户数据
      const response = await systemApi.updateProfile(updateData);
      
      if (response && response.code === 200) {
        // 更新本地数据
        const updatedUser = { ...userData, ...updateData };
        delete updatedUser.password; // 从本地数据中移除密码
        setUserData(updatedUser);
        
        // 更新localStorage和auth context中的用户数据
        const localStorageUser = {
          avatar: updatedUser.avatar,
          id: updatedUser.id,
          nickname: updatedUser.nickname,
          sex: updatedUser.sex || 0,
          username: updatedUser.username
        };
        
        // 获取当前token
        const token = localStorage.getItem('token');
        
        // 使用saveAuth函数同时更新localStorage和auth context
        if (token) {
          saveAuth(token, localStorageUser);
          
          // 如果有authUser，直接更新context
          if (authUser) {
            login(token, localStorageUser);
          }
          
          // 发布用户信息更新事件
          notifyUserProfileUpdated(localStorageUser);
        }
        
        // 清空密码字段
        form.setValue('password', '');
        form.setValue('confirmPassword', '');
        
        toast({
          title: "个人资料已更新",
          description: "您的个人资料信息已成功保存。",
          variant: "success",
        });
      } else {
        toast({
          variant: "destructive",
          title: "更新失败",
          description: response?.msg || "保存个人资料时出现错误，请稍后再试。",
        });
      }
    } catch (error) {
      console.error('保存用户数据失败:', error);
      toast({
        variant: "destructive",
        title: "更新失败",
        description: "保存个人资料时出现错误，请稍后再试。",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">加载中...</div>;
  }

  if (!userData) {
    return <div className="flex items-center justify-center p-8">无法加载个人资料</div>;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-8'
      >
        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={userData.avatar} alt={userData.nickname} />
            <AvatarFallback>{userData.nickname.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-medium">{userData.nickname}</h3>
            <p className="text-sm text-muted-foreground">ID: {userData.id}</p>
            {userData.is_admin && (
              <p className="text-xs text-primary mt-1">管理员账号</p>
            )}
          </div>
        </div>

        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>用户名</FormLabel>
              <FormControl>
                <Input 
                  placeholder='请输入用户名' 
                  {...field} 
                  disabled 
                  className="bg-muted cursor-not-allowed"
                />
              </FormControl>
              <FormDescription>
                用户名不可更改。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name='nickname'
          render={({ field }) => (
            <FormItem>
              <FormLabel>昵称</FormLabel>
              <FormControl>
                <Input placeholder='请输入昵称' {...field} />
              </FormControl>
              <FormDescription>
                这是您在系统中显示的名称，可以随时更改。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name='avatar'
          render={({ field }) => (
            <FormItem>
              <FormLabel>头像URL</FormLabel>
              <FormControl>
                <Input placeholder='请输入头像图片地址' {...field} />
              </FormControl>
              <FormDescription>
                输入有效的图片URL地址作为您的头像。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name='sex'
          render={({ field }) => (
            <FormItem>
              <FormLabel>性别</FormLabel>
              <Select
                value={field.value.toString()}
                onValueChange={(value) => {
                  // 确保值为有效数字
                  const numValue = parseInt(value);
                  if (!isNaN(numValue)) {
                    field.onChange(numValue);
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择性别" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0">未设置</SelectItem>
                  <SelectItem value="1">男</SelectItem>
                  <SelectItem value="2">女</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                选择您的性别。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-medium mb-4">修改密码</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>新密码</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder='输入新密码' {...field} />
                  </FormControl>
                  <FormDescription>
                    如不需要修改密码，请留空。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>确认新密码</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder='再次输入新密码' {...field} />
                  </FormControl>
                  <FormDescription>
                    请再次输入新密码进行确认。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <Button 
          type='submit' 
          disabled={isSubmitting}
        >
          {isSubmitting ? '更新中...' : '更新个人资料'}
        </Button>
      </form>
    </Form>
  )
}
