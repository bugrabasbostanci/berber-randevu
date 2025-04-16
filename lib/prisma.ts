import { PrismaClient } from '@prisma/client'

// Global tipini tanımla 
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Geliştirme ortamında hot reload sırasında çoklu Prisma Client oluşumunu önle
export const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') global.prisma = prisma 