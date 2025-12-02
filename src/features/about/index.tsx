import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Search } from '@/components/search'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IconBrandGithub, IconExternalLink, IconHeart } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

// 版本更新日志数据
const CHANGE_LOGS = [
  {
    version: 'v1.0.0',
    date: '2025-06-05',
    description: '初始版本',
    changes: [
      { type: 'feature', content: '基础UI界面设计' },
      { type: 'feature', content: '用户认证功能' },
      { type: 'feature', content: '基本数据管理' }
    ]
  }
]

// 技术栈信息
const TECH_STACK = [
  { name: 'ShadcnUI', description: 'TailwindCSS + RadixUI' },
  { name: 'Vite', description: '构建工具' },
  { name: 'TanStack Router', description: '路由系统' },
  { name: 'TypeScript', description: '类型检查' },
  { name: 'Eslint & Prettier', description: '代码质量与格式化' },
  { name: 'Tabler Icons', description: '图标库' },
  { name: 'Clerk', description: '身份验证（部分）' }
]

// 类型徽章颜色映射
const TYPE_BADGE_COLOR: Record<string, string> = {
  feature: 'bg-green-500',
  improvement: 'bg-blue-500',
  fix: 'bg-amber-500'
}

export default function About() {
  const [activeTab, setActiveTab] = useState('changelog')
  
  return (
    <>
      {/* 顶部导航 */}
      <Header fixed>
        <Search placeholder="搜索..." />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* 主内容 */}
      <Main>
        <div className='mb-8'>
          <h2 className='text-3xl font-bold tracking-tight'>关于系统</h2>
          <p className='text-muted-foreground'>
            版本信息、更新日志及技术栈
          </p>
        </div>

        <Tabs 
          defaultValue="changelog" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="changelog">更新日志</TabsTrigger>
            <TabsTrigger value="about">关于</TabsTrigger>
          </TabsList>
          
          {/* 更新日志标签页 */}
          <TabsContent value="changelog" className="space-y-4">
            {CHANGE_LOGS.map((log) => (
              <Card key={log.version}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {log.version}
                        <span className="text-sm text-muted-foreground">
                          {log.date}
                        </span>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {log.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {log.changes.map((change, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Badge 
                          className={`${TYPE_BADGE_COLOR[change.type]} text-white mt-0.5`}
                        >
                          {change.type === 'feature' && '新功能'}
                          {change.type === 'improvement' && '改进'}
                          {change.type === 'fix' && '修复'}
                        </Badge>
                        <span>{change.content}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          {/* 关于标签页 */}
          <TabsContent value="about" className="space-y-6">
            {/* 项目信息 */}
            <Card>
              <CardHeader>
                <CardTitle>项目信息</CardTitle>
                <CardDescription>项目基本信息和链接</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="font-semibold">SimpleExam Admin Dashboard</h3>
                    <p className="text-sm text-muted-foreground">
                      基于<a href="https://github.com/satnaing/shadcn-admin" target="_blank" rel="noopener noreferrer" className="text-primary underline"> shadcn-admin </a>构建的考试系统管理后台
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">技术栈</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {TECH_STACK.map((tech) => (
                      <div key={tech.name} className="flex items-center gap-2">
                        <Badge variant="outline">{tech.name}</Badge>
                        <span className="text-sm text-muted-foreground">{tech.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* 作者信息 */}
            <Card>
              <CardHeader>
                <CardTitle>作者信息</CardTitle>
                <CardDescription>关于项目作者</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="https://img.imwlw.com/i/2024/11/15/67370c8463ee5.png" alt="Sat Naing" />
                    <AvatarFallback>SN</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2 text-center md:text-left">
                    <h3 className="text-xl font-semibold">levywang</h3>
                    <p className="text-muted-foreground">Full-Stack Developer</p>
                    <p>
                      开心搬砖每一天
                    </p>
                    <div className="flex gap-2 justify-center md:justify-start">
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href="https://github.com/levywang" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          <IconBrandGithub className="h-4 w-4" />
                          GitHub
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href="https://blog.imwlw.com/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          <IconExternalLink className="h-4 w-4" />
                          博客
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <p className="flex items-center justify-center gap-1 text-muted-foreground">
                    Made with <IconHeart className="h-4 w-4 text-red-500" /> by levywang
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* 许可证信息 */}
            <Card>
              <CardHeader>
                <CardTitle>许可证</CardTitle>
              </CardHeader>
              <CardContent>
                <p>本项目采用 <a href="https://choosealicense.com/licenses/mit/" target="_blank" rel="noopener noreferrer" className="underline text-primary">MIT License</a> 授权许可</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
} 