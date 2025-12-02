import { Root, Content, Trigger } from '@radix-ui/react-popover'
import { IconQuestionMark } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface Props extends React.ComponentProps<typeof Root> {
  contentProps?: React.ComponentProps<typeof Content>
  triggerProps?: React.ComponentProps<typeof Trigger>
}

export function LearnMore({
  children,
  contentProps,
  triggerProps,
  ...props
}: Props) {
  return (
    <Popover {...props}>
      <PopoverTrigger
        className={cn('inline-flex items-center justify-center size-5 rounded-full border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground', triggerProps?.className)}
        {...triggerProps}
      >
        <span className='sr-only'>Learn more</span>
        <IconQuestionMark className='size-3' />
      </PopoverTrigger>
      <PopoverContent
        side='top'
        align='start'
        {...contentProps}
        className={cn('text-muted-foreground text-sm', contentProps?.className)}
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}
