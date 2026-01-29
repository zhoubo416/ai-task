import { z } from 'zod'
import prisma from '~/server/utils/db'
import { getUserFromToken } from '~/server/utils/auth'
import { evaluateTaskCompletion } from '~/server/utils/ai'

const completeSchema = z.object({
  conversation: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })),
  attemptId: z.string().optional()
})

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
  
  const task = await prisma.task.findUnique({
    where: { id: taskId }
  })

  if (!task) {
    throw createError({
      statusCode: 404,
      message: '任务不存在'
    })
  }

  try {
    const body = await readBody(event)
    const { conversation, attemptId } = completeSchema.parse(body)

    let attempt = attemptId
      ? await prisma.taskCompletion.findFirst({
          where: { id: attemptId, userId: user.id, taskId: task.id }
        })
      : null

    if (!attempt) {
      attempt = await prisma.taskCompletion.create({
        data: {
          userId: user.id,
          taskId: task.id,
          status: 'pending',
          conversation: JSON.stringify(conversation)
        }
      })
    }

    // AI评估任务完成情况
    const evaluation = await evaluateTaskCompletion(
      task.role,
      task.goal,
      conversation
    )

    // 计算积分（根据完成度和最大积分）
    const rawPoints = Math.floor((evaluation.score / 100) * task.maxPoints)

    const existingCompletion = await prisma.taskCompletion.findFirst({
      where: {
        userId: user.id,
        taskId: task.id,
        status: 'completed',
        NOT: { id: attempt.id }
      }
    })

    const points = evaluation.completed && !existingCompletion ? rawPoints : 0

    await prisma.taskCompletion.update({
      where: { id: attempt.id },
      data: {
        points,
        score: evaluation.score,
        feedback: evaluation.feedback,
        conversation: JSON.stringify(conversation),
        status: evaluation.completed ? 'completed' : 'failed',
        completedAt: new Date()
      }
    })

    // 如果完成，更新用户积分
    if (evaluation.completed && points > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          points: {
            increment: points
          }
        }
      })
    }

    return {
      success: true,
      completed: evaluation.completed,
      score: evaluation.score,
      points,
      feedback: evaluation.feedback
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || '提交任务失败'
    })
  }
})
