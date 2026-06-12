import { z } from 'zod'

// 选项模型
export const questionOptionSchema = z.object({
  label: z.string(),
  text: z.string(),
})

export type QuestionOption = z.infer<typeof questionOptionSchema>

// 问题类型枚举
export enum QuestionType {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
  JUDGE = 'judge',
}

// 单个问题模型
export const questionSchema = z.object({
  id: z.number(),
  type: z.string(),
  type_desc: z.string().optional(),
  question: z.string(),
  options: z.array(questionOptionSchema),
  answer: z.string(),
  explanation: z.string().optional().nullable(),
  course_id: z.number(),
  course_name: z.string().optional(),
  course_category_level2: z.string().optional(),
  created_at: z.string(),
})

export type Question = z.infer<typeof questionSchema>

// 问题列表模型
export const questionListSchema = z.object({
  items: z.array(questionSchema),
  total: z.number(),
})

export type QuestionList = z.infer<typeof questionListSchema>

// 问题表单数据模型
export const questionFormSchema = z.object({
  type: z.enum(['single', 'multiple', 'judge']),
  question: z.string().min(1, "题目内容不能为空"),
  options: z.array(
    z.object({
      label: z.string(),
      text: z.string().min(1, "选项内容不能为空"),
    })
  ).min(2, "至少需要两个选项"),
  answer: z.string().min(1, "请选择正确答案"),
  explanation: z.string().optional(),
  course_id: z.number().min(1, "请选择所属课程"),
})

export type QuestionFormData = z.infer<typeof questionFormSchema> 