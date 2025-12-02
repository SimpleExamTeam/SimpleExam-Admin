import { z } from 'zod'

// 课程状态模式
export const courseStatusSchema = z.union([
  z.literal('active'),
  z.literal('draft'),
  z.literal('archived'),
])

export type CourseStatus = z.infer<typeof courseStatusSchema>

// 考试配置项模式
export const examConfigItemSchema = z.object({
  type: z.string(),
  count: z.number(),
  score: z.number()
})

export type ExamConfigItem = z.infer<typeof examConfigItemSchema>

// 模拟考试配置模式
export const mockExamConfigSchema = z.object({
  min: z.number(),
  count: z.number(),
  score: z.number()
})

export type MockExamConfig = z.infer<typeof mockExamConfigSchema>

// 默认配置
export const DEFAULT_EXAM_CONFIG: ExamConfigItem[] = [
  { type: 'single', count: 20, score: 2 },
  { type: 'multiple', count: 15, score: 2 },
  { type: 'judge', count: 15, score: 2 }
];

export const DEFAULT_MOCK_EXAM_CONFIG: MockExamConfig = {
  min: 60,
  count: 50,
  score: 60
};

// 课程模式
export const courseSchema = z.object({
  id: z.number(),
  name: z.string(),
  cover: z.string(),
  price: z.number(),
  description: z.string().optional(),
  category_level1: z.string().optional(),
  category_level2: z.string().optional(),
  category_sort1: z.number().optional(),
  category_sort2: z.number().optional(),
  expire_days: z.number().optional(),
  sort: z.number().optional(),
  exam_config: z.union([z.string(), z.array(examConfigItemSchema), z.any()]).optional(),
  mock_exam_config: z.union([z.string(), mockExamConfigSchema, z.any()]).optional(),
})

export type Course = z.infer<typeof courseSchema>

// 课程列表模式
export const courseListSchema = z.object({
  items: z.array(courseSchema),
  total: z.number(),
})

export type CourseList = z.infer<typeof courseListSchema> 