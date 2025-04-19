import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay } from "date-fns"
import { formatDate } from "@/lib/utils"

export async function POST(request: Request) {
  try {
    const { userId, date } = await request.json()
    
    if (!userId || !date) {
      return NextResponse.json(
        { error: "Kullanıcı ID ve tarih gereklidir" },
        { status: 400 }
      )
    }
    
    // Gelen tarihi işle
    const parsedDate = typeof date === 'string' ? new Date(date) : new Date(date)
    
    // Geçerli bir tarih mi kontrol et
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Geçersiz tarih formatı" },
        { status: 400 }
      )
    }
    
    // Günün başlangıç ve bitişini hesapla
    const dayStart = startOfDay(parsedDate)
    const dayEnd = endOfDay(parsedDate)
    
    // Log ekleme
    console.log(`Gün açma isteği - Kullanıcı: ${userId}, Tarih: ${formatDate(dayStart, "yyyy-MM-dd")}`)
    
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
      count: deletedSlots.count
    })
  } catch (error) {
    console.error("Gün açılırken hata oluştu:", error)
    return NextResponse.json(
      { error: "Gün açılamadı" },
      { status: 500 }
    )
  }
} 