import { z } from 'zod'

// 用户简略信息
export const feedbackUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  nickname: z.string(),
})

export type FeedbackUser = z.infer<typeof feedbackUserSchema>

// 反馈状态
export const feedbackStatusSchema = z.union([
  z.literal(0), // 未确认
  z.literal(1), // 已确认
])

export type FeedbackStatus = z.infer<typeof feedbackStatusSchema>

// 单条反馈信息
export const feedbackSchema = z.object({
  id: z.number(),
  user: feedbackUserSchema,
  feedback_content: z.string(),
  status: feedbackStatusSchema,
  reply_content: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type Feedback = z.infer<typeof feedbackSchema>

// 反馈列表
export const feedbackListSchema = z.object({
  items: z.array(feedbackSchema),
  total: z.number(),
})

export type FeedbackList = z.infer<typeof feedbackListSchema>

// 更新反馈请求
export const updateFeedbackSchema = z.object({
  status: feedbackStatusSchema.optional(),
  reply_content: z.string().optional(),
})

export type UpdateFeedbackRequest = z.infer<typeof updateFeedbackSchema> 