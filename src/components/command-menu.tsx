import React from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  IconArrowRightDashed,
  IconChevronRight,
  IconDeviceLaptop,
  IconMoon,
  IconSun,
} from '@tabler/icons-react'
import { useSearch } from '@/context/search-context'
import { useTheme } from '@/context/theme-context'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { sidebarData } from './layout/data/sidebar-data'
import { ScrollArea } from './ui/scroll-area'
import { 
  BlurDialog, 
  BlurDialogContent, 
} from '@/components/ui/blur-dialog'

export function CommandMenu() {
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const { open, setOpen } = useSearch()

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false)
      command()
    },
    [setOpen]
  )

  return (
    <BlurDialog open={open} onOpenChange={setOpen} modal>
      <BlurDialogContent className="max-w-[500px] p-0 gap-0 overflow-hidden bg-background">
        <Command className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <CommandInput placeholder='输入命令或搜索...' />
          <CommandList>
            <ScrollArea type='hover' className='h-72 pr-1'>
              <CommandEmpty>没有找到结果</CommandEmpty>
              {sidebarData.navGroups.map((group) => (
                <CommandGroup key={group.title} heading={group.title}>
                  {group.items.map((navItem, i) => {
                    if (navItem.url)
                      return (
                        <CommandItem
                          key={`${navItem.url}-${i}`}
                          value={navItem.title}
                          onSelect={() => {
                            runCommand(() => navigate({ to: navItem.url }))
                          }}
                        >
                          <div className='mr-2 flex h-4 w-4 items-center justify-center'>
                            <IconArrowRightDashed className='text-muted-foreground/80 size-2' />
                          </div>
                          {navItem.title}
                        </CommandItem>
                      )

                    return navItem.items?.map((subItem, i) => (
                      <CommandItem
                        key={`${navItem.title}-${subItem.url}-${i}`}
                        value={`${navItem.title}-${subItem.url}`}
                        onSelect={() => {
                          runCommand(() => navigate({ to: subItem.url }))
                        }}
                      >
                        <div className='mr-2 flex h-4 w-4 items-center justify-center'>
                          <IconArrowRightDashed className='text-muted-foreground/80 size-2' />
                        </div>
                        {navItem.title} <IconChevronRight className="mx-1 size-3 text-muted-foreground/70" /> {subItem.title}
                      </CommandItem>
                    ))
                  })}
                </CommandGroup>
              ))}
              <CommandSeparator />
              <CommandGroup heading='主题'>
                <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
                  <IconSun className="mr-1" /> <span>浅色模式</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
                  <IconMoon className='scale-90 mr-1' />
                  <span>深色模式</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
                  <IconDeviceLaptop className="mr-1" />
                  <span>系统默认</span>
                </CommandItem>
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </BlurDialogContent>
    </BlurDialog>
  )
}
