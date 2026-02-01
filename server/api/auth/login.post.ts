import { z } from 'zod'
import prisma from '~/server/utils/db'
import { verifyPassword, generateToken } from '~/server/utils/auth'

const loginSchema = z.object({
  username: z.string(),
  password: z.string()
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { username, password } = loginSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        message: '用户名或密码错误'
      })
    }

    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      throw createError({
        statusCode: 401,
        message: '用户名或密码错误'
      })
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    })

    return {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        points: user.points
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    if (error?.message?.includes('closed the connection') || error?.code === 'P1017') {
      throw createError({
        statusCode: 503,
        message: '数据库连接失败，请稍后再试'
      })
    }
    throw createError({
      statusCode: 400,
      message: error.message || '登录失败'
    })
  }
})
