import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay } from "date-fns"
import { formatDate, safeParseDate } from "@/lib/utils"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const userId = searchParams.get("userId")

    if (!date || !userId) {
      return NextResponse.json(
        { error: "Tarih ve kullanıcı ID'si gereklidir" },
        { status: 400 }
      )
    }

    // Gelen tarihi parse et
    const inputDate = safeParseDate(date)
    const targetTime = formatDate(inputDate, "HH:mm")
    
    // Günün başlangıç ve bitişini belirle
    const dayStart = startOfDay(inputDate)
    const dayEnd = endOfDay(inputDate)

    // İlgili güne ait tüm kapalı slotları getir
    const closedSlots = await prisma.closedSlot.findMany({
      where: {
        userId: parseInt(userId),
        date: {
          gte: dayStart,
          lte: dayEnd
        }
      }
    })

    // Saati eşleşen slotu bul
    const isClosed = closedSlots.some(slot => {
      const slotTime = formatDate(slot.date, "HH:mm")
      return slotTime === targetTime
    })

    return NextResponse.json({ isClosed })
  } catch (error) {
    console.error("Kapatılmış saat dilimi kontrolü sırasında hata:", error)
    return NextResponse.json(
      { error: "Kapatılmış saat dilimi kontrolü yapılamadı" },
      { status: 500 }
    )
  }
} 