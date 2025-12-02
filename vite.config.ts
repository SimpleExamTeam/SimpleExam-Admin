import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  const basePath = env.VITE_BASE_PATH || '/'
  
  return {
    base: basePath, // 设置基础路径
    plugins: [
      TanStackRouterVite({
        target: 'react',
        // 禁用自动代码分割
        autoCodeSplitting: false,
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),

        // fix loading all icon chunks in dev mode
        // https://github.com/tabler/tabler-icons/issues/1233
        '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
      },
    },
    server: {
      port: 3000,
      strictPort: true, // 如果端口被占用，则会抛出错误而不是尝试下一个可用端口
      allowedHosts: ['localhost', 'dev.imwlw.com', 'sc.itsharestudio.cn'], // 允许的主机列表
    },
    build: {
      // 禁用代码分割
      cssCodeSplit: false, // 将所有CSS合并为一个文件
      // 增加警告限制，避免大文件警告
      chunkSizeWarningLimit: 1000,
      // 优化打包配置，大幅减少JS文件数量
      rollupOptions: {
        output: {
          // 更激进的合并策略
          manualChunks(id) {
            // 将vendor文件拆分为更小的块
            if (id.includes('node_modules')) {
              // React核心库
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react-core';
              }
              
              // React相关库和hook库
              if (id.includes('hook-form') || id.includes('query') || id.includes('zustand')) {
                return 'vendor-react-libs';
              }
              
              // Radix UI组件库
              if (id.includes('@radix')) {
                return 'vendor-radix';
              }
              
              // TanStack路由和查询库
              if (id.includes('@tanstack')) {
                return 'vendor-tanstack';
              }
              
              // 工具类库（tailwind, lucide等）
              if (id.includes('tailwind') || 
                  id.includes('lucide') || 
                  id.includes('class-variance-authority') || 
                  id.includes('clsx') || 
                  id.includes('tailwind-merge')) {
                return 'vendor-utils';
              }
              
              // 图表库单独打包，因为体积较大
              if (id.includes('recharts') || id.includes('date-fns')) {
                return 'vendor-charts';
              }
              
              // 其他所有第三方库
              return 'vendor-others';
            }
            
            // 将所有应用代码合并为一个文件，解决循环依赖问题
            return 'app';
          },
          // 精简输出文件命名
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]'
        }
      },
      // 使用esbuild压缩器
      minify: 'esbuild',
    },
  }
})
