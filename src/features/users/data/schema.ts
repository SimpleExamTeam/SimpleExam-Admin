import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('invited'),
  z.literal('suspended'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

// User schema
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  nickname: z.string(),
  avatar: z.string(),
  is_admin: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  open_id: z.string(),
  union_id: z.string(),
  sex: z.number(),
  country: z.string(),
  province: z.string(),
  city: z.string(),
})

export type User = z.infer<typeof userSchema>

// User list schema
export const userListSchema = z.object({
  items: z.array(userSchema),
  total: z.number(),
})

export type UserList = z.infer<typeof userListSchema>
