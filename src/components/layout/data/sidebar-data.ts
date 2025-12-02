import {
  IconLayoutDashboard,
  IconSettings,
  IconUserCog,
  IconPalette,
  IconHelp,
  IconUsers,
  IconBook2,
  IconShoppingCart,
  IconInfoCircle,
  IconList,
  IconMessage,
  IconTicket,
} from '@tabler/icons-react'
import { type SidebarData } from '../types'
import { getAssetPath } from '@/lib/utils'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: getAssetPath('/avatars/shadcn.jpg'),
  },
  teams: [
    {
      name: 'SimpleExam Admin',
      logo: IconBook2,
      plan: 'Version 1.0',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: '仪表盘',
          url: '/',
          icon: IconLayoutDashboard,
        },
        {
          title: '用户管理',
          url: '/users',
          icon: IconUsers,
        },
        {
          title: '用户反馈',
          url: '/feedback',
          icon: IconMessage,
        },
        {
          title: '课程管理',
          url: '/courses',
          icon: IconBook2,
        },
        {
          title: '题库管理',
          url: '/questions',
          icon: IconList,
        },
        {
          title: '订单管理',
          url: '/orders',
          icon: IconShoppingCart,
        },
        {
          title: '卡券管理',
          url: '/cards',
          icon: IconTicket,
        },
      ],
    },
    {
      title: '其他',
      items: [
        {
          title: '设置',
          icon: IconSettings,
          items: [
            {
              title: '个人资料',
              url: '/settings',
              icon: IconUserCog,
            },
            {
              title: '外观',
              url: '/settings/appearance',
              icon: IconPalette,
            }
          ],
        },
        {
          title: '关于',
          url: '/about',
          icon: IconInfoCircle,
        },
        {
          title: '帮助中心',
          url: '/help-center',
          icon: IconHelp,
        },
      ],
    },
  ],
}
