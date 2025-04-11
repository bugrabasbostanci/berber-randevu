import { prisma } from "../lib/prisma"

async function main() {
  try {
    const allowedUser = await prisma.allowedUser.create({
      data: {
        email: "bb0143sbw@gmail.com"
      }
    })

    console.log("İzin verilen kullanıcı başarıyla eklendi:", allowedUser)
  } catch (error) {
    console.error("Kullanıcı eklenirken hata oluştu:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 