import { z } from 'zod'

// 订单状态模式
export const orderStatusSchema = z.union([
  z.literal('pending'),  // 待支付
  z.literal('unpaid'),   // 未支付
  z.literal('paid'),     // 已支付
  z.literal('cancelled'), // 已取消
  z.literal('refunded'), // 已退款
  z.literal('refunding'), // 退款中
])

export type OrderStatus = z.infer<typeof orderStatusSchema>

// 订单模式
export const orderSchema = z.object({
  id: z.number(),
  order_no: z.string(),
  amount: z.number(),
  course_id: z.number(),
  course_name: z.string(),
  status: z.string(),
  created_at: z.string(),
  expire_time: z.string().nullable(),
  pay_time: z.string().nullable(),
  payment_type: z.string(),
  user: z.object({
    id: z.number(),
    username: z.string(),
    nickname: z.string(),
  }),
})

export type Order = z.infer<typeof orderSchema>

// 订单列表模式
export const orderListSchema = z.object({
  items: z.array(orderSchema),
  total: z.number(),
})

export type OrderList = z.infer<typeof orderListSchema> 