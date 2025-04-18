import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay, formatDate, safeParseDate } from "@/lib/utils"
import { DATE_FORMAT } from "@/lib/utils"

export async function POST(request: Request) {
  try {
    const { userId, date } = await request.json()
    
    // Gelen tarihi güvenli bir şekilde işle
    const inputDate = typeof date === 'string' ? safeParseDate(date) : date
    console.log(`Zaman dilimi açma - Gelen tarih: ${inputDate.toISOString()}`)
    
    // Hedef saat formatını al
    const targetTime = formatDate(inputDate, DATE_FORMAT.ISO_TIME)
    console.log(`Hedef zaman dilimi: ${targetTime}`)
    
    // O günün başlangıç ve bitişini hesaplama
    const dayStart = startOfDay(inputDate)
    const dayEnd = endOfDay(inputDate)
    
    // İlgili güne ait tüm kapalı slotları getir
    const daySlots = await prisma.closedSlot.findMany({
      where: {
        userId,
        date: {
          gte: dayStart,
          lte: dayEnd
        }
      }
    })
    
    // Saati uyuşan slotları bul
    const matchingSlots = daySlots.filter(slot => {
      const slotTime = formatDate(slot.date, DATE_FORMAT.ISO_TIME)
      const matches = slotTime === targetTime
      console.log(`Slot ${slotTime} - hedef ${targetTime}: ${matches ? 'Eşleşti' : 'Eşleşmedi'}`)
      return matches
    })
    
    // Eşleşen slotları silmek için ID'lerini topla
    if (matchingSlots.length > 0) {
      const slotIds = matchingSlots.map(slot => slot.id)
      const deleteResult = await prisma.closedSlot.deleteMany({
        where: {
          id: {
            in: slotIds
          }
        }
      })
      console.log(`Saat eşleşmesiyle silinen: ${deleteResult.count}`)
      
      return NextResponse.json({
        message: `${deleteResult.count} zaman dilimi açıldı`,
        count: deleteResult.count
      })
    }
    
    return NextResponse.json({
      message: "Açılacak zaman dilimi bulunamadı",
      count: 0
    })
  } catch (error) {
    console.error("Zaman dilimi açılırken hata oluştu:", error)
    return NextResponse.json(
      { error: "Zaman dilimi açılamadı" },
      { status: 500 }
    )
  }
} 