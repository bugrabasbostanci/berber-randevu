import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { prisma } from './lib/prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Prisma ile izin verilen hesapları kontrol et
          const allowedUser = await prisma.allowedUser.findUnique({
            where: {
              email: user.email!
            }
          })

          if (!allowedUser) {
            return false
          }

          return true
        } catch (error) {
          console.error('Giriş hatası:', error)
          return false
        }
      }
      return false
    },
  },
  secret: process.env.AUTH_SECRET,
})