## SimpleExam Admin

### 简介

SimpleExam Admin 是 SimpleExam 在线考试系统的 **管理后台**，基于 **React 19 + Vite 6 + TypeScript + TailwindCSS 4 + Radix UI + TanStack Router/Query/Table** 构建。  
主要用于对考试系统的用户、题库、课程、订单、卡券、反馈等进行统一管理，并提供完善的统计分析与运营支持能力。

### 技术栈

- **框架**: React 19（函数式组件 + Hooks）
- **构建工具**: Vite 6
- **语言**: TypeScript
- **路由**: @tanstack/react-router
- **数据管理 / 请求缓存**: @tanstack/react-query
- **全局状态**: Zustand
- **UI 组件**: Radix UI + 自定义 Shadcn 风格组件（`src/components/ui`）
- **样式**: TailwindCSS 4
- **图表与可视化**: Recharts
- **表单**: react-hook-form + zod

### 功能特性（概览）

- **认证与安全**
  - 管理员账号登录 / 退出登录
  - Token 校验与过期自动处理
  - 微信扫码 / 网页授权登录支持
- **用户与权限管理**
  - 用户列表、详情、创建、编辑、删除
  - 管理员标识过滤
- **课程与题库管理**
  - 课程列表、详情、创建、编辑、删除
  - 题目列表、筛选、创建、编辑、删除
  - 题目批量删除、导入 / 导出
- **订单与支付**
  - 订单列表 / 详情 / 状态更新
  - 订单退款
- **卡券管理**
  - 卡券创建、更新、删除
  - 卡券兑换记录查询
- **反馈与系统运维**
  - 用户反馈列表 / 处理 / 删除
  - 登录日志查询
  - 销售统计与系统信息
- **UI / UX**
  - 明亮 / 暗色主题切换
  - 字体配置与全局主题管理
  - 响应式布局与导航进度条
  - 顶部通知、弹窗、表单校验等

### 目录结构（简要）

```text
.
├─ public/                # 静态资源（图标、favicon 等）
├─ src/
│  ├─ assets/             # 静态资源（前端使用）
│  ├─ components/         # 通用组件（含 UI 组件库）
│  ├─ config/             # 字体等配置
│  ├─ context/            # React Context（主题、搜索、订单等）
│  ├─ features/           # 业务模块（用户、课程、题库、订单等）
│  ├─ hooks/              # 自定义 Hooks
│  ├─ lib/                # API 客户端与工具
│  ├─ routes/             # TanStack Router 路由配置
│  ├─ stores/             # Zustand 状态存储
│  ├─ utils/              # 通用工具方法
│  ├─ main.tsx            # 应用入口
│  └─ routeTree.gen.ts    # 自动生成的路由树（勿手动修改）
├─ index.html             # 应用 HTML 入口
├─ vite.config.ts         # Vite 配置
├─ package.json           # NPM 包与脚本配置
└─ pnpm-lock.yaml         # pnpm 锁文件
```

### 环境要求

- **Node.js**: 建议 ≥ 18.x
- **包管理器**: 推荐使用 **pnpm**

### 快速开始

1. **克隆仓库**

```bash
git clone <your-repo-url>
cd SimpleExam-Admin
```

2. **安装依赖**

```bash
pnpm install
```

3. **开发环境启动**

```bash
# 默认本地开发
pnpm dev

# 使用代理配置（如需本地代理到后端）
pnpm dev:proxy
```

Vite 默认会在 `http://localhost:3000` 启动（见 `vite.config.ts` 中 `server.port` 配置）。

### 环境变量配置

根目录可创建 `.env` 或 `.env.local` 等文件（已在 `.gitignore` 中忽略），常用变量包括：

- **`VITE_BASE_PATH`**：部署时的基础路径前缀，默认为 `/`。  
  - 例如部署在 `/admin/` 子路径下，可设置：`VITE_BASE_PATH=/admin/`
- **`VITE_API_BASE_URL`**：后端 API 网关根路径，默认 `/api/v1`。  
  - 例如：`VITE_API_BASE_URL=https://api.simpleexam.com/api/v1`

> 说明：  
> - `VITE_BASE_PATH` 由 `vite.config.ts` 和 `src/main.tsx` 共同使用，用于静态资源和路由的基础路径。  
> - `VITE_API_BASE_URL` 在 `src/lib/api.ts` 中使用，用于构造所有后端请求的完整 URL。

### 常用脚本命令

在项目根目录执行：

```bash
# 本地开发
pnpm dev
pnpm dev:proxy

# 生产构建
pnpm build          # tsc + vite build
pnpm build:no-check # 跳过 TypeScript 类型检查，仅构建

# 预览生产构建
pnpm preview

# 代码质量
pnpm lint           # 运行 ESLint
pnpm format         # 使用 Prettier 格式化代码
pnpm format:check   # 检查格式而不修改

# 依赖分析（未使用代码检测等）
pnpm knip
```

### 接口文档

本项目的后端接口文档位于仓库根目录的 `API.md`，由 OpenAPI 文档通过 `@tarslib/widdershins` 生成。  
你可以在本地直接打开该文件，查看所有管理端接口的路径、请求参数与响应示例（登录、用户管理、课程、题库、订单、卡券、反馈等）。

### 部署

1. **构建生产版本**

```bash
pnpm build
```

构建产物将生成在 `dist/` 目录下，可由任意静态资源服务器托管（如 Nginx、Netlify、Vercel 等）。  
本仓库包含 `netlify.toml`，可直接用于 Netlify 部署路由与代理配置。

2. **本地预览生产构建**

```bash
pnpm preview
```

Vite 会启动一个本地静态服务器预览 `dist/` 内容。

### License

本项目基于 **MIT License** 开源，详细内容见仓库根目录的 `LICENSE` 文件。
