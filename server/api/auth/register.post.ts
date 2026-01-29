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

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      throw createError({
        statusCode: 400,
        message: '用户名已存在'
      })
    }

    // 创建用户
    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        isAdmin: false,
        points: 0
      }
    })

    // 生成token
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
    throw createError({
      statusCode: 400,
      message: error.message || '注册失败'
    })
  }
})
