import { z } from 'zod'
import prisma from '~/server/utils/db'
import { getUserFromToken } from '~/server/utils/auth'

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  role: z.string().min(1),
  goal: z.string().min(1),
  maxPoints: z.number().min(1).max(1000).default(100),
  isActive: z.boolean().optional()
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

  if (!user || !user.isAdmin) {
    throw createError({
      statusCode: 403,
      message: '需要管理员权限'
    })
  }

  try {
    const taskId = getRouterParam(event, 'id')
    if (!taskId) {
      throw createError({
        statusCode: 400,
        message: '任务 ID 缺失'
      })
    }

    const body = await readBody(event)
    const data = taskSchema.parse(body)

    const task = await prisma.task.update({
      where: { id: taskId },
      data
    })

    return {
      success: true,
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        role: task.role,
        goal: task.goal,
        maxPoints: task.maxPoints,
        isActive: task.isActive
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 400,
      message: error.message || '更新任务失败'
    })
  }
})
