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

  return {
    id: user.id,
    username: user.username,
    isAdmin: user.isAdmin,
    points: user.points
  }
})
