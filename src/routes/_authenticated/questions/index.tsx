import Questions from '@/features/questions'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/questions/')({
  component: Questions,
}) 