import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    // 格式化为 YYYY-MM-DD HH:MM:SS
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('日期格式化错误:', error);
    return dateString || '-';
  }
}

/**
 * 获取资源的完整路径
 * @param path 资源路径，以/开头
 * @returns 带有正确基础路径的完整URL
 */
export function getAssetPath(path: string): string {
  const basePath = import.meta.env.VITE_BASE_PATH || '/';
  
  // 确保路径以/开头，并避免双斜杠
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // 确保基础路径以/结尾
  const normalizedBasePath = basePath.endsWith('/') 
    ? basePath 
    : `${basePath}/`;
  
  // 连接基础路径和资源路径，并避免双斜杠
  return `${normalizedBasePath.slice(0, -1)}${normalizedPath}`;
}
