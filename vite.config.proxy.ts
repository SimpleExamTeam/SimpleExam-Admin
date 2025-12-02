import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({
      target: 'react',
      autoCodeSplitting: true,
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
    port: 3060, // 直接在配置中指定端口
    strictPort: true, // 如果端口被占用，则会抛出错误而不是尝试下一个可用端口
    proxy: {
      // 代理所有 /api 请求到后端服务器
      '/api': {
        target: 'http://localhost:8080/api', // 修改为与环境变量匹配的地址
        changeOrigin: true,
        secure: false,
        // 如果后端API没有 /api 前缀，可以使用 rewrite 进行重写
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
  },
}) 