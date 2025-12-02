'use client'

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { 
  BlurDialog,
  BlurDialogContent,
} from '@/components/ui/blur-dialog'
import { Button } from '@/components/ui/button'
import { User } from '../data/schema'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { IconCalendar, IconId, IconUser, IconMapPin, IconIdBadge2, IconGenderMale, IconGenderFemale, IconGenderBigender, IconCopy, IconCheck, IconTrash, IconPencil, IconShoppingCart } from '@tabler/icons-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useUsers } from '../context/users-context'
import { UsersDeleteDialog } from './users-delete-dialog'
import { useNavigate } from '@tanstack/react-router'
import { useOrdersContext } from '@/context/orders-context'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersViewDialog({ currentRow, open, onOpenChange }: Props) {
  const [openIdCopied, setOpenIdCopied] = useState(false);
  const [unionIdCopied, setUnionIdCopied] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const { setOpen, setCurrentRow } = useUsers();
  const navigate = useNavigate();
  const ordersContext = useOrdersContext();

  const handleCopy = (text: string, type: 'openid' | 'unionid') => {
    navigator.clipboard.writeText(text);
    
    if (type === 'openid') {
      setOpenIdCopied(true);
      setTimeout(() => setOpenIdCopied(false), 2000);
    } else {
      setUnionIdCopied(true);
      setTimeout(() => setUnionIdCopied(false), 2000);
    }
    
    toast({
      description: "已复制到剪贴板",
      duration: 2000,
    });
  };

  const handleViewUserOrders = () => {
    // 关闭当前对话框
    onOpenChange(false);
    
    // 如果有订单上下文，直接设置搜索参数
    if (ordersContext) {
      // 设置用户ID搜索参数
      ordersContext.handleSearch({
        user_id: currentRow.id.toString(),
        page: 1
      });
      
      // 跳转到订单页面
      navigate({ to: '/orders' });
      
      // 显示提示
      toast({
        title: "正在查询用户订单",
        description: `正在显示用户 ${currentRow.nickname || currentRow.username} 的订单`,
        duration: 3000,
      });
    } else {
      // 如果没有上下文，使用普通导航
      navigate({ to: '/orders' });
      
      // 显示提示
      toast({
        title: "跳转到订单页面",
        description: "请手动搜索用户ID: " + currentRow.id,
        duration: 3000,
      });
    }
  };

  return (
    <>
      <BlurDialog
        open={open}
        onOpenChange={onOpenChange}
      >
        <BlurDialogContent className='sm:max-w-2xl max-h-[90vh]'>
          <DialogHeader className='text-left'>
            <DialogTitle className="text-foreground/90 text-xl">用户详情</DialogTitle>
            <DialogDescription className="text-muted-foreground/90">
              查看用户 <span className="font-medium">{currentRow.nickname}</span> 的详细信息
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[65vh] pr-4 -mr-4 scrollbar-thin">
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                <Avatar className="h-16 w-16 ring-2 ring-background/40 ring-offset-2 ring-offset-background/80">
                  <AvatarImage src={currentRow.avatar} alt={currentRow.nickname} />
                  <AvatarFallback>{currentRow.nickname?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{currentRow.nickname}</h3>
                      <p className="text-sm text-muted-foreground">{currentRow.username}</p>
                    </div>
                    <Badge variant={currentRow.is_admin ? 'default' : 'secondary'}>
                      {currentRow.is_admin ? '管理员' : '普通用户'}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <IconId className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>ID: {currentRow.id}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {currentRow.sex === 1 ? (
                        <IconGenderMale className="h-3.5 w-3.5 text-blue-500" />
                      ) : currentRow.sex === 2 ? (
                        <IconGenderFemale className="h-3.5 w-3.5 text-pink-500" />
                      ) : (
                        <IconGenderBigender className="h-3.5 w-3.5 text-gray-500" />
                      )}
                      <span>{currentRow.sex === 1 ? '男' : currentRow.sex === 2 ? '女' : '未知'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-foreground/10" />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                  <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                    <IconUser className="h-3.5 w-3.5" /> 个人信息
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground/90">用户名</p>
                      <p className="text-sm font-medium truncate" title={currentRow.username}>
                        {currentRow.username}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground/90">昵称</p>
                      <p className="text-sm font-medium truncate" title={currentRow.nickname}>
                        {currentRow.nickname}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                  <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                    <IconMapPin className="h-3.5 w-3.5" /> 地区信息
                  </h4>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground/90">详细地区</p>
                    <p className="text-sm font-medium">
                      {`${currentRow.country || ''} ${currentRow.province || ''} ${currentRow.city || ''}`.trim() || '未设置'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                  <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                    <IconCalendar className="h-3.5 w-3.5" /> 时间信息
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground/90">创建时间</p>
                      <p className="text-sm font-medium">{formatDate(currentRow.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground/90">更新时间</p>
                      <p className="text-sm font-medium">{formatDate(currentRow.updated_at)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-background/10 shadow-sm">
                  <h4 className="text-xs font-medium text-muted-foreground/90 uppercase flex items-center gap-1">
                    <IconIdBadge2 className="h-3.5 w-3.5" /> 平台标识
                  </h4>
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-medium text-muted-foreground/90">OpenID</p>
                          {currentRow.open_id && (
                            <Button
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5 ml-2 hover:bg-background/80"
                              onClick={() => handleCopy(currentRow.open_id, 'openid')}
                              title="复制到剪贴板"
                            >
                              {openIdCopied ? (
                                <IconCheck className="h-3 w-3 text-green-500" />
                              ) : (
                                <IconCopy className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                        <div className="bg-background/40 backdrop-blur-sm rounded-md px-2 py-1 border border-background/20">
                          <p className="text-sm font-medium truncate w-full" title={currentRow.open_id || '未设置'}>
                            {currentRow.open_id || '未设置'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-medium text-muted-foreground/90">UnionID</p>
                          {currentRow.union_id && (
                            <Button
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5 ml-2 hover:bg-background/80"
                              onClick={() => handleCopy(currentRow.union_id, 'unionid')}
                              title="复制到剪贴板"
                            >
                              {unionIdCopied ? (
                                <IconCheck className="h-3 w-3 text-green-500" />
                              ) : (
                                <IconCopy className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                        <div className="bg-background/40 backdrop-blur-sm rounded-md px-2 py-1 border border-background/20">
                          <p className="text-sm font-medium truncate w-full" title={currentRow.union_id || '未设置'}>
                            {currentRow.union_id || '未设置'}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground/80 italic mt-2">
                        提示: 鼠标悬停可查看完整ID，点击按钮可复制
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          
          <DialogFooter className="mt-4">
            <div className="flex w-full justify-between items-center gap-2">
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="h-8 hover:bg-destructive/90 text-sm"
                >
                  <IconTrash className="h-3.5 w-3.5 mr-1" />
                  删除用户
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleViewUserOrders}
                  className="h-8 text-sm"
                >
                  <IconShoppingCart className="h-3.5 w-3.5 mr-1" />
                  查看订单
                </Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="h-8 hover:bg-background/60 backdrop-blur-sm border-background/20 text-sm"
                >
                  关闭
                </Button>
                <Button
                  onClick={() => {
                    // 直接设置为编辑状态，不需要关闭当前对话框
                    setCurrentRow(currentRow);
                    setOpen('edit');
                  }}
                  className="h-8 hover:bg-primary/90 text-sm"
                >
                  <IconPencil className="h-3.5 w-3.5 mr-1" />
                  编辑
                </Button>
              </div>
            </div>
          </DialogFooter>
        </BlurDialogContent>
      </BlurDialog>

      {/* 删除确认对话框 */}
      <UsersDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        currentRow={currentRow}
      />
    </>
  )
} 