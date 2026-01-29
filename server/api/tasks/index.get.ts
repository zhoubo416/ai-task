import prisma from '~/server/utils/db'
import { getUserFromToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  // 检查是否是管理员
  const token = getCookie(event, 'auth-token') || getHeader(event, 'authorization')?.replace('Bearer ', '')
  let isAdmin = false
  
  if (token) {
    const user = await getUserFromToken(token)
    isAdmin = user?.isAdmin || false
  }

  // 管理员可以看到所有任务，普通用户只能看到激活的任务
  const tasks = await prisma.task.findMany({
    where: isAdmin ? {} : { isActive: true },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { completions: true }
      },
      completions: {
        where: { status: 'completed' },
        select: { id: true }
      }
    }
  })

  return tasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    role: task.role,
    goal: task.goal,
    maxPoints: task.maxPoints,
    isActive: task.isActive,
    createdAt: task.createdAt,
    participationCount: task._count.completions,
    completedCount: task.completions.length
  }))
})
