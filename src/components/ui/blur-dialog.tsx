'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

// 毛玻璃弹窗的主要组件
export function BlurDialog({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Dialog>) {
  return <Dialog {...props}>{children}</Dialog>
}

// 带有强模糊效果的覆盖层
export function BlurDialogOverlay({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogOverlay>) {
  return (
    <DialogOverlay
      className={cn(
        'fixed inset-0 z-50 bg-background/40 backdrop-blur-[8px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 transition-all duration-200',
        className
      )}
      {...props}
    />
  )
}

// 毛玻璃效果的内容容器
export function BlurDialogContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogContent>) {
  return (
    <DialogPortal>
      <BlurDialogOverlay />
      <DialogContent
        className={cn(
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background/80 p-6 shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=open]:duration-200 data-[state=closed]:duration-200 backdrop-blur-md border-background/20 shadow-xl rounded-lg',
          className
        )}
        {...props}
      >
        {children}
      </DialogContent>
    </DialogPortal>
  )
}

// 导出所有Dialog组件，方便使用
export {
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}

// 使用示例:
// <BlurDialog>
//   <BlurDialogContent>
//     <DialogHeader>
//       <DialogTitle>标题</DialogTitle>
//       <DialogDescription>描述</DialogDescription>
//     </DialogHeader>
//     内容
//     <DialogFooter>
//       <Button>按钮</Button>
//     </DialogFooter>
//   </BlurDialogContent>
// </BlurDialog> 