# 毛玻璃弹窗组件 (BlurDialog)

这是一个带有毛玻璃背景效果的弹窗组件，当弹窗打开时，背景内容会被模糊处理，使用户可以更加专注于弹窗中的内容。

## 特点

- 背景模糊效果：打开弹窗时，页面其他内容会添加模糊玻璃效果
- 动画过渡：弹窗打开和关闭时有流畅的动画
- 可定制：继承了原生Dialog的所有功能，同时支持样式定制
- 易用性：使用方式与标准Dialog组件几乎一致，易于集成

## 使用方法

```tsx
import {
  BlurDialog,
  BlurDialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/blur-dialog'

export function MyDialogComponent() {
  const [open, setOpen] = useState(false)
  
  return (
    <BlurDialog open={open} onOpenChange={setOpen}>
      <BlurDialogContent>
        <DialogHeader>
          <DialogTitle>弹窗标题</DialogTitle>
          <DialogDescription>弹窗描述</DialogDescription>
        </DialogHeader>
        
        {/* 弹窗内容 */}
        <div>内容区域</div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
          <Button onClick={() => setOpen(false)}>确认</Button>
        </DialogFooter>
      </BlurDialogContent>
    </BlurDialog>
  )
}
```

## 组件API

### BlurDialog

基础对话框容器，继承自`Dialog`组件的所有属性。

```tsx
<BlurDialog open={boolean} onOpenChange={(open) => void}>
  {children}
</BlurDialog>
```

### BlurDialogContent

弹窗内容容器，带有毛玻璃效果，继承自`DialogContent`组件的所有属性。

```tsx
<BlurDialogContent className="自定义样式">
  {children}
</BlurDialogContent>
```

## 示例

完整示例请参考 `src/components/ui/blur-dialog-demo.tsx`。

## 自定义样式

您可以通过传递 `className` 属性来自定义毛玻璃弹窗的样式：

```tsx
<BlurDialogContent className="sm:max-w-2xl bg-background/90">
  {/* 内容 */}
</BlurDialogContent>
```

## 注意事项

- 毛玻璃效果在某些较旧的浏览器中可能不能完全支持
- 避免在弹窗背景层中放置过多交互元素，以免用户体验受到影响 