import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay } from "date-fns"

export async function POST(request: Request) {
  try {
    const { userId, date } = await request.json()
    const dayStart = startOfDay(new Date(date))
    const dayEnd = endOfDay(new Date(date))

    // Gün içindeki tüm kapalı slotları sil
    const deletedSlots = await prisma.closedSlot.deleteMany({
      where: {
        userId,
        date: {
          gte: dayStart,
          lte: dayEnd
        }
      }
    })

    return NextResponse.json({
      message: `Gün başarıyla açıldı (${deletedSlots.count} zaman dilimi açıldı)`,
      deletedSlots
    })
  } catch (error) {
    console.error("Gün açılırken hata oluştu:", error)
    return NextResponse.json(
      { error: "Gün açılamadı" },
      { status: 500 }
    )
  }
} 