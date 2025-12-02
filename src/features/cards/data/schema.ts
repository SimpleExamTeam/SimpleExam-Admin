import { z } from 'zod'

// 卡券模式
export const cardSchema = z.object({
  id: z.number(),
  card_no: z.string(),
  amount: z.number(),
  course_id: z.number().nullable(),
  course_name: z.string(),
  total: z.number(),
  used: z.number(),
  expire_days: z.number(),
  expire_time: z.string(),
  created_at: z.string(),
  is_expired: z.boolean(),
})

export type Card = z.infer<typeof cardSchema>

// 卡券列表模式
export const cardListSchema = z.object({
  items: z.array(cardSchema),
  total: z.number(),
})

export type CardList = z.infer<typeof cardListSchema>

// 卡券详情模式（包含兑换记录）
export const cardDetailSchema = cardSchema.extend({
  records: z.array(z.any()).optional(), // 兑换记录，可以根据实际情况定义更详细的类型
})

export type CardDetail = z.infer<typeof cardDetailSchema>

// 卡券兑换记录模式
export const cardRecordSchema = z.object({
  id: z.number(),
  card_no: z.string().optional(),
  user_id: z.number(),
  username: z.string().optional(),
  nickname: z.string().optional().nullable(),
  course_id: z.number().optional(),
  course_name: z.string().optional(),
  created_at: z.string(),
})

export type CardRecord = z.infer<typeof cardRecordSchema>

// 卡券兑换记录列表模式
export const cardRecordListSchema = z.object({
  items: z.array(cardRecordSchema),
  total: z.number(),
})

export type CardRecordList = z.infer<typeof cardRecordListSchema> 