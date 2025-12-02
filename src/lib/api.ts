// API service for making authenticated requests
import { useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// 请求缓存管理
interface CacheItem {
  timestamp: number;
  data: any;
}

const requestCache = new Map<string, CacheItem>();
const CACHE_EXPIRY = 2000; // 缓存有效期，单位毫秒

// 生成缓存键
const generateCacheKey = (endpoint: string, options: RequestConfig): string => {
  const method = options.method || 'GET';
  const body = options.body ? JSON.stringify(options.body) : '';
  return `${method}:${endpoint}:${body}`;
};

// 检查缓存是否有效
const isCacheValid = (cacheKey: string): boolean => {
  if (!requestCache.has(cacheKey)) return false;
  
  const cacheItem = requestCache.get(cacheKey)!;
  const now = Date.now();
  return (now - cacheItem.timestamp) < CACHE_EXPIRY;
};

// Helper function to get auth token
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// 获取基础路径
const getBasePath = (): string => {
  return import.meta.env.VITE_BASE_PATH || '/';
};

// 获取登录页面的路径
export const getLoginPath = (): string => {
  // 登录页面应该位于基础路径下，例如：/admin/sign-in
  const basePath = getBasePath();
  // 确保路径格式正确
  let loginPath = basePath.endsWith('/') ? `${basePath}sign-in` : `${basePath}/sign-in`;
  // 规范化路径，处理可能的双斜杠
  loginPath = loginPath.replace(/\/+/g, '/');
  console.log('生成登录路径:', loginPath);
  return loginPath;
};

// API 响应接口
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data?: T;
  message?: string; // 兼容旧版API
}

// 请求拦截器配置
interface RequestConfig extends RequestInit {
  retries?: number;
  headers?: HeadersInit;
  disableCache?: boolean; // 是否禁用缓存
}

// Generic fetch function with authentication and retry logic
async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const { retries = 3, disableCache = false, ...fetchOptions } = options;
  
  // 如果不是GET请求或明确禁用缓存，则不使用缓存
  const useCache = !disableCache && (!fetchOptions.method || fetchOptions.method === 'GET');
  
  if (useCache) {
    const cacheKey = generateCacheKey(endpoint, options);
    
    // 检查缓存
    if (isCacheValid(cacheKey)) {
      return requestCache.get(cacheKey)!.data;
    }
  }
  
  let attempts = 0;

  while (attempts < retries) {
    try {
      const token = getToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      };

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
      });

      // Handle unauthorized responses
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // 直接重定向到登录页面，不添加额外的前缀
        window.location.href = getLoginPath();
        
        throw new Error('Unauthorized');
      }

      const data = await response.json();
      
      // 存入缓存
      if (useCache) {
        const cacheKey = generateCacheKey(endpoint, options);
        requestCache.set(cacheKey, {
          timestamp: Date.now(),
          data
        });
      }
      
      return data;
    } catch (error) {
      attempts++;
      if (attempts >= retries) {
        throw error;
      }
      // 指数退避重试
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
    }
  }

  throw new Error('Maximum retries reached');
}

// 自定义Hook，用于请求去重
export function useDeduplicatedEffect(
  effect: () => Promise<void> | void,
  deps: React.DependencyList,
  options: { dedupTime?: number } = {}
) {
  const { dedupTime = 300 } = options;
  
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      if (isMounted) {
        try {
          await effect();
        } catch (error) {
          console.error('Effect error:', error);
        }
      }
    }, dedupTime);
    
    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// 清除缓存
export function clearApiCache() {
  requestCache.clear();
}

// Auth API
export const authApi = {
  login: async (username: string, password: string): Promise<ApiResponse> => {
    const response = await fetch(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  },

  checkToken: async (): Promise<ApiResponse> => {
    return fetchWithAuth('/admin/check-token');
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // 直接重定向到登录页面，不添加额外的前缀
    window.location.href = getLoginPath();
  }
};

// WeChat Auth API
export const wechatAuthApi = {
  // 获取微信网页授权URL
  getOAuthUrl: async (state?: string): Promise<ApiResponse> => {
    const params = new URLSearchParams();
    if (state) params.append('state', state);

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`${BASE_URL}/admin/wechat/oauth/url${query}`);
    return response.json();
  },

  // 微信小程序登录
  miniProgramLogin: async (code: string): Promise<ApiResponse> => {
    const response = await fetch(`${BASE_URL}/admin/wechat/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });
    return response.json();
  },

  // 创建扫码登录二维码
  createQRCode: async (): Promise<ApiResponse> => {
    const response = await fetch(`${BASE_URL}/admin/wechat/qrcode/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  // 检查二维码状态
  checkQRCodeStatus: async (sceneStr: string): Promise<ApiResponse> => {
    const params = new URLSearchParams();
    params.append('scene_str', sceneStr);

    const response = await fetch(`${BASE_URL}/admin/wechat/qrcode/check?${params.toString()}`);
    return response.json();
  },

  // 处理微信网页授权回调
  handleOAuthCallback: async (code: string, state?: string): Promise<ApiResponse> => {
    const params = new URLSearchParams();
    params.append('code', code);
    if (state) params.append('state', state);

    const response = await fetch(`${BASE_URL}/admin/wechat/oauth/callback?${params.toString()}`);
    return response.json();
  },

  // 处理微信扫码登录回调
  handleQRCodeCallback: async (code: string, state: string): Promise<ApiResponse> => {
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('state', state);

    const response = await fetch(`${BASE_URL}/admin/wechat/qrcode/callback?${params.toString()}`);
    return response.json();
  }
};

// Users API
export const usersApi = {
  getUsers: async (params: { page?: number; size?: number; keyword?: string; is_admin?: boolean } = {}): Promise<ApiResponse> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.size) queryParams.append('size', params.size.toString());
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.is_admin !== undefined) queryParams.append('is_admin', params.is_admin.toString());
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchWithAuth(`/admin/users${query}`);
  },
  
  getUser: async (id: number): Promise<ApiResponse> => {
    return fetchWithAuth(`/admin/users/${id}`);
  },

  createUser: async (data: any): Promise<ApiResponse> => {
    return fetchWithAuth('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateUser: async (id: number, data: any): Promise<ApiResponse> => {
    return fetchWithAuth(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteUser: async (id: number): Promise<ApiResponse> => {
    return fetchWithAuth(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// 用户反馈API
export const feedbackApi = {
  getFeedbacks: async (params: { 
    page?: number; 
    size?: number; 
    username?: string;
    status?: number;
    start_time?: string;
    end_time?: string;
  } = {}): Promise<ApiResponse> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.size) queryParams.append('size', params.size.toString());
    if (params.username) queryParams.append('username', params.username);
    if (params.status !== undefined) queryParams.append('status', params.status.toString());
    if (params.start_time) queryParams.append('start_time', params.start_time);
    if (params.end_time) queryParams.append('end_time', params.end_time);
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchWithAuth(`/admin/users/feedback${query}`);
  },
  
  getFeedback: async (id: number): Promise<ApiResponse> => {
    return fetchWithAuth(`/admin/users/feedback/${id}`);
  },

  updateFeedback: async (id: number, data: { 
    status?: number; 
    reply_content?: string 
  }): Promise<ApiResponse> => {
    return fetchWithAuth(`/admin/users/feedback/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteFeedback: async (id: number): Promise<ApiResponse> => {
    return fetchWithAuth(`/admin/users/feedback/${id}`, {
      method: 'DELETE',
    });
  },
};

// Courses API
export const coursesApi = {
  getCourses: async (params: { page?: number; size?: number; keyword?: string } = {}): Promise<ApiResponse> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.size) queryParams.append('size', params.size.toString());
    if (params.keyword) queryParams.append('keyword', params.keyword);
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchWithAuth(`/admin/courses${query}`);
  },
  
  getCourse: async (id: number): Promise<ApiResponse> => {
    console.log(`获取课程详情，ID: ${id}`);
    const response = await fetchWithAuth(`/admin/courses/${id}`);
    console.log('课程详情API响应:', response);
    return response;
  },
  
  createCourse: async (data: any): Promise<ApiResponse> => {
    return fetchWithAuth('/admin/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  updateCourse: async (id: number, data: any): Promise<ApiResponse> => {
    return fetchWithAuth(`/admin/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  deleteCourse: async (id: number): Promise<ApiResponse> => {
    return fetchWithAuth(`/admin/courses/${id}`, {
      method: 'DELETE',
    });
  },
};

// 题库管理API
export const questionsApi = {
  getQuestions: async (params: {
    page?: number;
    size?: number;
    question?: string;
    question_id?: number;
    type?: string;
    course_id?: number;
    category_level1?: string;
  } = {}): Promise<ApiResponse> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.size) queryParams.append('size', params.size.toString());
    if (params.type) queryParams.append('type', params.type);
    if (params.question) queryParams.append('question', params.question);
    if (params.course_id) queryParams.append('course_id', params.course_id.toString());
    if (params.category_level1) queryParams.append('category_level1', params.category_level1);
    if (params.question_id) queryParams.append('question_id', params.question_id.toString());
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchWithAuth(`/admin/questions${query}`);
  },
  
  // 新增方法：直接通过ID获取题目
  getQuestionById: async (id: number): Promise<ApiResponse> => {
    return fetchWithAuth(`/admin/questions/${id}`);
  },
  
  getQuestion: async (id: number): Promise<ApiResponse> => {
    return fetchWithAuth(`/admin/questions/${id}`);
  },
  
  createQuestion: async (data: any): Promise<ApiResponse> => {
    return fetchWithAuth('/admin/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  updateQuestion: async (id: number, data: any): Promise<ApiResponse> => {
    return fetchWithAuth(`/admin/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  deleteQuestion: async (id: number): Promise<ApiResponse> => {
    return fetchWithAuth(`/admin/questions/${id}`, {
      method: 'DELETE',
    });
  },
  
  batchDeleteQuestions: async (ids: number[]): Promise<ApiResponse> => {
    // 在请求前先清除缓存
    clearApiCache();
    
    return fetchWithAuth('/admin/questions/batch-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
      disableCache: true, // 禁用缓存，确保请求总是发送到服务器
      headers: {
        'Content-Type': 'application/json' // 明确指定内容类型
      },
      retries: 1, // 减少重试次数
    });
  },
  
  exportQuestions: async (courseId?: number): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    if (courseId) queryParams.append('course_id', courseId.toString());
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const token = getToken();
    const headers: HeadersInit = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    
    const response = await fetch(`${BASE_URL}/admin/questions/export${query}`, {
      headers,
    });
    
    if (!response.ok) {
      throw new Error('导出失败');
    }
    
    return response.blob();
  },
  
  importQuestions: async (file: File, courseId?: number): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    // 如果指定了课程ID，添加到请求中
    if (courseId) {
      formData.append('course_id', courseId.toString());
    }
    
    const token = getToken();
    const headers: HeadersInit = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    
    const response = await fetch(`${BASE_URL}/admin/questions/import`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    return response.json();
  },
};

// Orders API
export const ordersApi = {
  getOrders: async (params: { 
    page?: number; 
    size?: number; 
    order_no?: string;
    username?: string;
    user_id?: string;
    status?: string;
    payment_type?: string;
    start_time?: string;
    end_time?: string; 
  } = {}): Promise<ApiResponse> => {
    // 创建URL参数，只添加有值的参数
    const queryParams = new URLSearchParams();
    
    // 只添加非空、非undefined的参数
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchWithAuth(`/admin/orders${query}`);
  },
  
  getOrder: async (id: number): Promise<ApiResponse> => {
    return fetchWithAuth(`/admin/orders/${id}`);
  },

  updateOrderStatus: async (id: number, status: string): Promise<ApiResponse> => {
    return fetchWithAuth(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
  
  deleteOrder: async (id: number): Promise<ApiResponse> => {
    return fetchWithAuth(`/admin/orders/${id}`, {
      method: 'DELETE',
    });
  },
  
  // 退款接口
  refundOrder: async (data: {
    order_no: string;
    refund_fee: number;
    refund_reason: string;
  }): Promise<ApiResponse> => {
    return fetchWithAuth('/admin/orders/refund', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
}; 

// 系统API
export const systemApi = {
  // 获取登录日志
  getLoginLogs: async (params: { 
    page?: number; 
    size?: number; 
    username?: string;
    status?: string;
    start_time?: string;
    end_time?: string; 
  } = {}): Promise<ApiResponse> => {
    // 创建基本URL参数
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.size) queryParams.append('size', params.size.toString());
    if (params.username) queryParams.append('username', params.username);
    if (params.status !== undefined) queryParams.append('status', params.status);
    
    // 生成基本查询字符串
    let query = queryParams.toString();
    
    // 手动添加日期时间参数，确保格式正确（空格编码为 %20 而不是 +）
    if (params.start_time) {
      const encodedStartTime = encodeURIComponent(params.start_time);
      query = query ? `${query}&start_time=${encodedStartTime}` : `start_time=${encodedStartTime}`;
    }
    
    if (params.end_time) {
      const encodedEndTime = encodeURIComponent(params.end_time);
      query = query ? `${query}&end_time=${encodedEndTime}` : `end_time=${encodedEndTime}`;
    }
    
    const finalQuery = query ? `?${query}` : '';
    return fetchWithAuth(`/admin/system/login-logs${finalQuery}`);
  },
  
  // 获取销售统计数据
  getSalesStatistics: async (params: {
    dimension: 'day' | 'month' | 'year';
    start_time: string;
    end_time: string;
  }): Promise<ApiResponse> => {
    // 创建URL参数
    const queryParams = new URLSearchParams();
    if (params.dimension) queryParams.append('dimension', params.dimension);
    
    // 直接添加日期时间参数，不进行额外编码
    if (params.start_time) {
      queryParams.append('start_time', params.start_time);
    }
    
    if (params.end_time) {
      queryParams.append('end_time', params.end_time);
    }
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchWithAuth(`/admin/system/sales-statistics${query}`);
  },
  
  // 获取系统信息
  getSystemInfo: async (): Promise<ApiResponse> => {
    return fetchWithAuth('/admin/system/system-info');
  },
  
  // 获取个人资料
  getProfile: async (): Promise<ApiResponse> => {
    return fetchWithAuth('/admin/system/profile');
  },
  
  // 更新个人资料
  updateProfile: async (data: {
    nickname?: string;
    avatar?: string;
    password?: string;
    sex?: number;
    country?: string;
    province?: string;
    city?: string;
  }): Promise<ApiResponse> => {
    return fetchWithAuth('/admin/system/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// 卡券管理API
export const cardsApi = {
  // 获取卡券列表
  getCards: async (params: { 
    page?: number; 
    size?: number;
    card_no?: string;
    course_id?: number;
  } = {}): Promise<ApiResponse> => {
    const queryParams = new URLSearchParams();
    
    // 只添加非空、非undefined的参数
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchWithAuth(`/admin/cards${query}`);
  },
  
  // 获取单个卡券详情
  getCard: async (id: number): Promise<ApiResponse> => {
    return fetchWithAuth(`/admin/cards/${id}`);
  },
  
  // 创建卡券
  createCard: async (data: {
    course_id: number;
    amount: number;
    total: number;
    expire_days: number;
  }): Promise<ApiResponse> => {
    return fetchWithAuth('/admin/cards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // 更新卡券
  updateCard: async (id: number, data: {
    course_id: number;
    amount: number;
    total: number;
    expire_days: number;
  }): Promise<ApiResponse> => {
    return fetchWithAuth(`/admin/cards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // 删除卡券
  deleteCard: async (id: number): Promise<ApiResponse> => {
    return fetchWithAuth(`/admin/cards/${id}`, {
      method: 'DELETE',
    });
  },
  
  // 获取卡券兑换记录
  getCardRecords: async (id: number, params: {
    page?: number;
    size?: number;
  } = {}): Promise<ApiResponse> => {
    const queryParams = new URLSearchParams();
    
    // 只添加非空、非undefined的参数
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchWithAuth(`/admin/cards/${id}/records${query}`);
  },
}; 