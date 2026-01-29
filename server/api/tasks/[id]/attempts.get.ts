import prisma from '~/server/utils/db'
import { getUserFromToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth-token') || getHeader(event, 'authorization')?.replace('Bearer ', '')

  if (!token) {
    throw createError({
      statusCode: 401,
      message: '未登录'
    })
  }

  const user = await getUserFromToken(token)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: '无效的token'
    })
  }

  const taskId = getRouterParam(event, 'id')
  if (!taskId) {
    throw createError({
      statusCode: 400,
      message: '任务 ID 缺失'
    })
  }

  const attempts = await prisma.taskCompletion.findMany({
    where: { userId: user.id, taskId },
    orderBy: { createdAt: 'desc' }
  })

  return attempts.map((attempt) => {
    let conversation: Array<{ role: 'user' | 'assistant'; content: string }> = []
    if (attempt.conversation) {
      try {
        conversation = JSON.parse(attempt.conversation)
      } catch {
        conversation = []
      }
    }
    return {
      id: attempt.id,
      status: attempt.status,
      points: attempt.points,
      score: attempt.score,
      feedback: attempt.feedback,
      createdAt: attempt.createdAt,
      completedAt: attempt.completedAt,
      conversation
    }
  })
})
