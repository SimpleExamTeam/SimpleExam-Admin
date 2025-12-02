'use client'

import { useState } from 'react'
import { Button } from './button'
import {
  BlurDialog,
  BlurDialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './blur-dialog'

export function BlurDialogDemo() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <Button variant="outline" onClick={() => setOpen(true)}>
        打开毛玻璃弹窗
      </Button>
      <BlurDialog open={open} onOpenChange={setOpen}>
        <BlurDialogContent>
          <DialogHeader>
            <DialogTitle>毛玻璃弹窗示例</DialogTitle>
            <DialogDescription>
              这是一个使用毛玻璃效果的弹窗示例，当弹窗打开时，背景内容会被模糊处理
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              毛玻璃效果会应用在弹窗背景上，使内容更加突出。这种设计可以让用户专注于弹窗中的内容，
              同时依然能够感知到背景页面的存在，提供更好的上下文感知。
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-background/60 backdrop-blur-sm p-3 rounded-md border border-background/10">
                <h4 className="text-sm font-medium">左侧内容</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  可以在这里展示一些内容，毛玻璃效果会使其显得更加现代化
                </p>
              </div>
              <div className="bg-background/60 backdrop-blur-sm p-3 rounded-md border border-background/10">
                <h4 className="text-sm font-medium">右侧内容</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  这是一个简单的示例，展示如何在内容区域应用毛玻璃效果
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button onClick={() => setOpen(false)}>确认</Button>
          </DialogFooter>
        </BlurDialogContent>
      </BlurDialog>
    </div>
  )
} 