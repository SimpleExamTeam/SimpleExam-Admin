import * as React from 'react'
import { IconBook2 } from '@tabler/icons-react'
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'
import { getAssetPath } from '@/lib/utils'

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  // 默认使用第一个团队，或者使用考试管理系统作为名称
  const activeTeam = teams[0] || { name: 'SimpleExam Admin', logo: IconBook2, plan: '' };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          className='pointer-events-none'
        >
          <div className='flex aspect-square size-10 items-center justify-center'>
            <img src={getAssetPath('/images/favicon.png')} alt="Logo" className="size-8" />
          </div>
          <div className='grid flex-1 text-left text-sm leading-tight ml-2'>
            <span className='truncate font-bold text-base'>
              {activeTeam.name}
            </span>
            {activeTeam.plan && (
              <span className='truncate text-xs text-muted-foreground'>{activeTeam.plan}</span>
            )}
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
