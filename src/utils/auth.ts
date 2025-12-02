/**
 * 检查用户是否已登录
 * @returns 如果已登录，返回用户信息；否则返回null
 */
export const checkAuth = (): { token: string; user: any } | null => {
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  
  if (!token || !userStr) {
    return null
  }
  
  try {
    const user = JSON.parse(userStr)
    return { token, user }
  } catch (error) {
    // 如果解析失败，清除存储的数据
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return null
  }
}

/**
 * 检查用户是否已登录，如果已登录则返回true
 * @returns 布尔值表示用户是否已登录
 */
export const isAuthenticated = (): boolean => {
  return checkAuth() !== null
}

/**
 * 获取当前登录用户信息
 * @returns 用户信息对象
 */
export const getCurrentUser = (): any | null => {
  const auth = checkAuth()
  return auth ? auth.user : null
}

/**
 * 获取认证令牌
 * @returns 认证令牌字符串
 */
export const getToken = (): string | null => {
  const auth = checkAuth()
  return auth ? auth.token : null
}

/**
 * 保存认证信息到本地存储
 * @param token 认证令牌
 * @param user 用户信息
 */
export const saveAuth = (token: string, user: any): void => {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

/**
 * 清除认证信息
 */
export const clearAuth = (): void => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
} 