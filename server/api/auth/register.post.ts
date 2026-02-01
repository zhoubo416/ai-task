import { z } from 'zod'
import prisma from '~/server/utils/db'
import { hashPassword, generateToken } from '~/server/utils/auth'

const registerSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(6)
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { username, password } = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      throw createError({
        statusCode: 400,
        message: '用户名已存在'
      })
    }

    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        isAdmin: false,
        points: 0
      }
    })

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
      message: error.message || '注册失败'
    })
  }
})
