/**
 * 微信相关工具函数
 */

/**
 * 检测是否在微信环境中
 * @returns {boolean} 是否在微信环境
 */
export const isWeChatEnvironment = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  
  // 检测微信内置浏览器
  const isWeChat = userAgent.includes('micromessenger');
  
  // 检测微信小程序环境
  const isMiniProgram = userAgent.includes('miniprogram') || 
                       window.__wxjs_environment === 'miniprogram';
  
  return isWeChat || isMiniProgram;
};

/**
 * 检测是否在微信小程序环境中
 * @returns {boolean} 是否在微信小程序环境
 */
export const isMiniProgramEnvironment = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  return userAgent.includes('miniprogram') || 
         window.__wxjs_environment === 'miniprogram';
};

/**
 * 检测是否在微信内置浏览器中（非小程序）
 * @returns {boolean} 是否在微信内置浏览器
 */
export const isWeChatBrowser = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  return userAgent.includes('micromessenger') && !isMiniProgramEnvironment();
};

/**
 * 获取微信环境类型
 * @returns {'miniprogram' | 'wechat' | 'browser'} 环境类型
 */
export const getWeChatEnvironmentType = (): 'miniprogram' | 'wechat' | 'browser' => {
  if (isMiniProgramEnvironment()) {
    return 'miniprogram';
  }
  
  if (isWeChatBrowser()) {
    return 'wechat';
  }
  
  return 'browser';
};

/**
 * 检测是否支持微信登录
 * @returns {boolean} 是否支持微信登录
 */
export const supportWeChatLogin = (): boolean => {
  return isWeChatEnvironment();
};

/**
 * 获取当前页面URL（用于微信授权回调）
 * @returns {string} 当前页面URL
 */
export const getCurrentPageUrl = (): string => {
  if (typeof window === 'undefined') {
    return '';
  }
  
  return window.location.href;
};

/**
 * 构建微信授权回调URL
 * @param baseUrl 基础URL
 * @returns {string} 回调URL
 */
export const buildWeChatCallbackUrl = (baseUrl: string): string => {
  // 确保URL以/结尾
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBaseUrl}admin/wechat-callback`;
};

/**
 * 扩展Window接口以支持微信小程序环境检测
 */
declare global {
  interface Window {
    __wxjs_environment?: string;
  }
}
