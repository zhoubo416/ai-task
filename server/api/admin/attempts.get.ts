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

  if (!user || !user.isAdmin) {
    throw createError({
      statusCode: 403,
      message: '需要管理员权限'
    })
  }

  const { taskId } = getQuery(event) as { taskId?: string }

  const attempts = await prisma.taskCompletion.findMany({
    where: taskId ? { taskId } : {},
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, username: true } },
      task: { select: { id: true, title: true } }
    }
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
      task: attempt.task,
      user: attempt.user,
      conversation
    }
  })
})
