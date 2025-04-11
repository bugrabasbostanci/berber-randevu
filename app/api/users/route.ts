import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const users = await prisma.allowedUser.findMany({
      where: {
        id: {
          in: [1, 2] // Sadece berber (id: 1) ve çalışan (id: 2)
        }
      },
      orderBy: {
        id: 'asc' // id'ye göre sıralama yaparak berber her zaman önce gelsin
      },
      include: {
        closedSlots: true
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Kullanıcılar getirilirken hata oluştu:", error)
    return NextResponse.json(
      { error: "Kullanıcılar getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
} 