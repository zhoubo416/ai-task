import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

// Neon/PG 可能会回收空闲连接，遇到 P1017 时自动重连并重试一次
prisma.$use(async (params, next) => {
  try {
    return await next(params)
  } catch (err: any) {
    if (err?.code === 'P1017') {
      await prisma.$connect()
      return await next(params)
    }
    throw err
  }
})

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
