import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error']
  })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

prisma.$use(async (params, next) => {
  try {
    return await next(params)
  } catch (err: any) {
    if (err?.code === 'P1017' || err?.message?.includes('closed the connection')) {
      try {
        await prisma.$disconnect()
        await new Promise(resolve => setTimeout(resolve, 1000))
        await prisma.$connect()
        return await next(params)
      } catch (reconnectErr) {
        console.error('Database reconnection failed:', reconnectErr)
        throw new Error('Database connection failed. Please try again.')
      }
    }
    throw err
  }
})

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
