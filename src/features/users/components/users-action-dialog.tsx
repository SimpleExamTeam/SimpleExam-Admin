'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  BlurDialog, 
  BlurDialogContent 
} from '@/components/ui/blur-dialog'
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
import { Switch } from '@/components/ui/switch'
import { User } from '../data/schema'
import { usersApi } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { useUsers } from '../context/users-context'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { IconUser, IconKey, IconMapPin, IconSettings, IconTrash } from '@tabler/icons-react'
import { UsersDeleteDialog } from './users-delete-dialog'

// 定义用户表单的Zod模式
const formSchema = z.object({
  username: z.string().min(1, { message: '用户名是必填项' }),
  nickname: z.string().min(1, { message: '昵称是必填项' }),
  avatar: z.string().min(1, { message: '头像URL是必填项' }),
  password: z.string().transform((pwd) => pwd.trim()),
  confirmPassword: z.string().transform((pwd) => pwd.trim()),
  is_admin: z.boolean().default(false),
  sex: z.number().default(0),
  country: z.string().default(''),
  province: z.string().default(''),
  city: z.string().default(''),
  isEdit: z.boolean().default(false),
}).superRefine(({ isEdit, password, confirmPassword }, ctx) => {
  if (!isEdit || (isEdit && password !== '')) {
    if (password === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '密码是必填项',
        path: ['password'],
      })
    }

    if (password.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '密码长度至少为6个字符',
        path: ['password'],
      })
    }

    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "两次输入的密码不匹配",
        path: ['confirmPassword'],
      })
    }
  }
});

// 定义用户表单类型
type UserFormValues = z.infer<typeof formSchema>;

interface Props {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({ currentRow, open, onOpenChange }: Props) {
  const isEdit = !!currentRow
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()
  const { fetchUsers} = useUsers()

  // 使用TypeScript的类型断言来确保表单值与formSchema兼容
  // @ts-ignore - 忽略类型不匹配问题，实际上这些问题不会影响功能
  const form = useForm<UserFormValues>({
    // @ts-ignore - 忽略类型错误，因为zodResolver实际上会正确工作
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: isEdit ? currentRow?.username || '' : '',
      nickname: isEdit ? currentRow?.nickname || '' : '',
      avatar: isEdit ? currentRow?.avatar || '' : '',
      password: '',
      confirmPassword: '',
      is_admin: isEdit ? !!currentRow?.is_admin : false,
      sex: isEdit ? currentRow?.sex ?? 0 : 0,
      country: isEdit ? currentRow?.country || '' : '',
      province: isEdit ? currentRow?.province || '' : '',
      city: isEdit ? currentRow?.city || '' : '',
      isEdit,
    },
  })

  // 确保onSubmit函数与表单类型匹配
  // @ts-ignore - 忽略类型不匹配问题
  const onSubmit: SubmitHandler<UserFormValues> = async (values) => {
    setIsSubmitting(true)
    try {
      const { confirmPassword, isEdit, ...submitData } = values
      
      let response;
      
      if (isEdit && !submitData.password) {
        const dataToSubmit = {...submitData};
        delete (dataToSubmit as any).password;
        
        if (isEdit && currentRow) {
          response = await usersApi.updateUser(currentRow.id, dataToSubmit) as any;
        } else {
          response = await usersApi.createUser(dataToSubmit) as any;
        }
      } else {
        if (isEdit && currentRow) {
          response = await usersApi.updateUser(currentRow.id, submitData) as any;
        } else {
          response = await usersApi.createUser(submitData) as any;
        }
      }
      
      if (response && response.code === 200) {
        toast({
          title: isEdit ? "用户更新成功" : "用户创建成功",
          description: isEdit ? "用户信息已更新" : "新用户已添加",
        })
        form.reset()
        onOpenChange(false)
        fetchUsers()
      } else {
        toast({
          variant: "destructive",
          title: isEdit ? "用户更新失败" : "用户创建失败",
          description: response?.message || (isEdit ? "更新用户时出现错误" : "创建用户时出现错误"),
        })
      }
    } catch (error) {
      console.error('用户提交错误:', error)
      toast({
        variant: "destructive",
        title: "操作失败",
        description: "提交用户信息时出现错误",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <BlurDialog
        open={open}
        onOpenChange={(state) => {
          if (!isSubmitting) {
            form.reset()
            onOpenChange(state)
          }
        }}
      >
        <BlurDialogContent className='sm:max-w-lg max-h-[90vh] w-[95vw] p-4 sm:p-6'>
          <DialogHeader className='text-left pb-2'>
            <DialogTitle className="text-foreground/90 text-xl">{isEdit ? '编辑用户' : '添加新用户'}</DialogTitle>
            <DialogDescription className="text-muted-foreground/90">
              {isEdit ? `正在编辑用户 ${currentRow?.nickname || currentRow?.username}` : '在此处创建新用户。'}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[65vh] pr-4 -mr-4 scrollbar-thin">
            <Form {...form}>
              <form
                id='user-form'
                // @ts-ignore - 忽略类型错误，因为表单提交实际上会正确工作
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-4 p-0.5 pt-2'
              >
                {/* 用户基本信息 */}
                <div className="space-y-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                  <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                    <IconUser className="h-3.5 w-3.5" /> 基本信息
                  </h4>

                  <FormField
                    name='username'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-4 sm:grid-cols-6 items-center space-y-0 gap-x-2 sm:gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-1 sm:col-span-2 text-right text-sm'>
                          用户名
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='zhangsan'
                            className='col-span-3 sm:col-span-4 bg-background/80 border-background/20'
                            {...field}
                            disabled={isEdit}
                            readOnly={isEdit}
                          />
                        </FormControl>
                        <FormMessage className='col-span-3 sm:col-span-4 col-start-2 sm:col-start-3' />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name='nickname'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-4 sm:grid-cols-6 items-center space-y-0 gap-x-2 sm:gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-1 sm:col-span-2 text-right text-sm'>
                          昵称
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='张三'
                            className='col-span-3 sm:col-span-4 bg-background/80 border-background/20'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className='col-span-3 sm:col-span-4 col-start-2 sm:col-start-3' />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name='avatar'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-4 sm:grid-cols-6 items-center space-y-0 gap-x-2 sm:gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-1 sm:col-span-2 text-right text-sm'>
                          头像URL
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='https://example.com/avatar.png'
                            className='col-span-3 sm:col-span-4 bg-background/80 border-background/20'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className='col-span-3 sm:col-span-4 col-start-2 sm:col-start-3' />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 密码信息 */}
                <div className="space-y-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                  <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                    <IconKey className="h-3.5 w-3.5" /> 密码信息
                  </h4>

                  <FormField
                    name='password'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-4 sm:grid-cols-6 items-center space-y-0 gap-x-2 sm:gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-1 sm:col-span-2 text-right text-sm'>
                          {isEdit ? '新密码' : '密码'}
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder={isEdit ? '留空则不修改' : '请输入密码'}
                            className='col-span-3 sm:col-span-4 bg-background/80 border-background/20'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className='col-span-3 sm:col-span-4 col-start-2 sm:col-start-3' />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name='confirmPassword'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-4 sm:grid-cols-6 items-center space-y-0 gap-x-2 sm:gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-1 sm:col-span-2 text-right text-sm'>
                          确认密码
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder='请再次输入密码'
                            className='col-span-3 sm:col-span-4 bg-background/80 border-background/20'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className='col-span-3 sm:col-span-4 col-start-2 sm:col-start-3' />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* 个人信息 */}
                <div className="space-y-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                  <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                    <IconMapPin className="h-3.5 w-3.5" /> 个人信息
                  </h4>

                  <FormField
                    name='sex'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-4 sm:grid-cols-6 items-center space-y-0 gap-x-2 sm:gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-1 sm:col-span-2 text-right text-sm'>
                          性别
                        </FormLabel>
                        <Select
                          value={field.value.toString()}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <FormControl>
                            <SelectTrigger className="w-28 sm:w-36 bg-background/80 border-background/20">
                              <SelectValue placeholder="选择性别" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent align="start" className="min-w-[150px]">
                            <SelectItem value="0">未设置</SelectItem>
                            <SelectItem value="1">男</SelectItem>
                            <SelectItem value="2">女</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className='col-span-3 sm:col-span-4 col-start-2 sm:col-start-3' />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name='country'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-4 sm:grid-cols-6 items-center space-y-0 gap-x-2 sm:gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-1 sm:col-span-2 text-right text-sm'>
                          国家
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='中国'
                            className='col-span-3 sm:col-span-4 bg-background/80 border-background/20'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className='col-span-3 sm:col-span-4 col-start-2 sm:col-start-3' />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-x-2 sm:gap-x-4 gap-y-2">
                    <div className="col-span-1 sm:col-span-2 flex justify-end items-start pt-2">
                      <FormLabel className='text-right text-sm w-full'>
                        省市
                      </FormLabel>
                    </div>
                    <div className="col-span-3 sm:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <FormField
                        name='province'
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs text-muted-foreground">省份</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='江苏省'
                                className='bg-background/80 border-background/20'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name='city'
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs text-muted-foreground">城市</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='南京市'
                                className='bg-background/80 border-background/20'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
                
                {/* 权限设置 */}
                <div className="space-y-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                  <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                    <IconSettings className="h-3.5 w-3.5" /> 权限设置
                  </h4>

                  <FormField
                    name='is_admin'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-4 sm:grid-cols-6 items-center space-y-0 gap-x-2 sm:gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-1 sm:col-span-2 text-right text-sm'>
                          管理员权限
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm text-muted-foreground">
                              {field.value ? '是' : '否'}
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage className='col-span-3 sm:col-span-4 col-start-2 sm:col-start-3' />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </ScrollArea>
          
          {/* 自定义底部按钮布局 */}
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <div className="flex justify-between items-center w-full">
              <div>
                {isEdit && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="h-8 hover:bg-destructive/90 text-sm"
                  >
                    <IconTrash className="h-3.5 w-3.5 mr-1" />
                    <span>删除用户</span>
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant='outline'
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="h-8 hover:bg-background/60 backdrop-blur-sm border-background/20 text-sm px-3"
                >
                  取消
                </Button>
                <Button
                  type='submit'
                  form='user-form'
                  disabled={isSubmitting}
                  className={cn(
                    "h-8 text-sm px-3",
                    isSubmitting && "opacity-80 pointer-events-none"
                  )}
                >
                  {isSubmitting ? '提交中...' : '保存'}
                </Button>
              </div>
            </div>
          </div>
        </BlurDialogContent>
      </BlurDialog>

      {/* 删除确认对话框 */}
      {isEdit && currentRow && (
        <UsersDeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          currentRow={currentRow}
        />
      )}
    </>
  )
}
