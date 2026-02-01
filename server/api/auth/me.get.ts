import prisma from '~/server/utils/db'
import { getUserFromToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
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
        message: '无效的token或用户不存在'
      })
    }

    return {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      points: user.points
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    if (error?.message?.includes('Database connection failed')) {
      throw createError({
        statusCode: 503,
        message: '数据库连接失败，请稍后再试'
      })
    }
    throw createError({
      statusCode: 400,
      message: error.message || '获取用户信息失败'
    })
  }
})
