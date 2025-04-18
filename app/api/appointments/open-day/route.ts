import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay } from "date-fns"
import { formatDate, safeParseDate } from "@/lib/utils"

export async function POST(request: Request) {
  try {
    const { userId, date } = await request.json()
    
    // Gelen tarihi güvenli bir şekilde işle
    const rawDate = typeof date === 'string' ? date : date.toISOString()
    console.log(`Gün açma - Alınan tarih: ${rawDate}`)
    
    // Tarihi parse et
    const parsedDate = safeParseDate(rawDate)
    
    // Günün başlangıç ve bitişini hesapla
    const dayStart = startOfDay(parsedDate)
    const dayEnd = endOfDay(parsedDate)
    
    console.log(`Gün başlangıcı: ${formatDate(dayStart, "yyyy-MM-dd HH:mm:ss")}`)
    console.log(`Gün bitişi: ${formatDate(dayEnd, "yyyy-MM-dd HH:mm:ss")}`)

    // Gün içindeki tüm kapalı slotları getir (silmeden önce)
    const existingSlots = await prisma.closedSlot.findMany({
      where: {
        userId,
        date: {
          gte: dayStart,
          lte: dayEnd
        }
      }
    })
    
    console.log(`Silinecek slot sayısı: ${existingSlots.length}`)
    existingSlots.forEach(slot => {
      console.log(`- ${formatDate(slot.date, "HH:mm")}`)
    })

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