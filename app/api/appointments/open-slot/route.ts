import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { userId, date } = await request.json()

    // Zaman dilimini aç
    const deletedSlot = await prisma.closedSlot.deleteMany({
      where: {
        userId,
        date: new Date(date)
      }
    })

    return NextResponse.json(deletedSlot)
  } catch (error) {
    console.error("Zaman dilimi açılırken hata oluştu:", error)
    return NextResponse.json(
      { error: "Zaman dilimi açılamadı" },
      { status: 500 }
    )
  }
} 