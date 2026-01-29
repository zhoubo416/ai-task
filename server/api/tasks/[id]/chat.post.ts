import { z } from 'zod'
import prisma from '~/server/utils/db'
import { getUserFromToken } from '~/server/utils/auth'
import { chatWithAI } from '~/server/utils/ai'

const chatSchema = z.object({
  message: z.string().min(1),
  conversation: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).default([]),
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
    const { message, conversation, attemptId } = chatSchema.parse(body)

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

    let baseConversation = conversation
    if (attempt.conversation) {
      try {
        baseConversation = JSON.parse(attempt.conversation)
      } catch {
        baseConversation = conversation
      }
    }

    // 添加用户消息到对话
    const updatedConversation = [
      ...baseConversation,
      { role: 'user' as const, content: message }
    ]

    // 获取AI回复
    const aiResponse = await chatWithAI(
      task.role,
      task.goal,
      updatedConversation
    )

    // 添加AI回复到对话
    const finalConversation = [
      ...updatedConversation,
      { role: 'assistant' as const, content: aiResponse }
    ]

    await prisma.taskCompletion.update({
      where: { id: attempt.id },
      data: {
        conversation: JSON.stringify(finalConversation),
        status: 'pending'
      }
    })

    return {
      success: true,
      response: aiResponse,
      conversation: finalConversation,
      attemptId: attempt.id
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'AI对话失败'
    })
  }
})
