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
      // 使用默认的 Rollup 分包策略，避免手动拆分导致的循环依赖
      rollupOptions: undefined,
      // 使用esbuild压缩器
      minify: 'esbuild',
    },
  }
})
