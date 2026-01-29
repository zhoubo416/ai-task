import prisma from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  const task = await prisma.task.findUnique({
    where: { id }
  })

  if (!task) {
    throw createError({
      statusCode: 404,
      message: '任务不存在'
    })
  }

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    role: task.role,
    goal: task.goal,
    maxPoints: task.maxPoints,
    createdAt: task.createdAt
  }
})
