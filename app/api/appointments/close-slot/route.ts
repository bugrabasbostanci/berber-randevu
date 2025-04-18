import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay } from "date-fns"
import { formatDate, safeParseDate } from "@/lib/utils"

export async function POST(request: Request) {
  try {
    const { userId, date, reason } = await request.json()
    
    // Gelen tarihi güvenli bir şekilde işle
    const rawDate = typeof date === 'string' ? date : date.toISOString()
    console.log(`Gelen raw tarih: ${rawDate}`)
    
    // Tarihi parse et
    const inputDate = safeParseDate(rawDate)
    console.log(`Oluşturulan tarih nesnesi: ${inputDate.toISOString()}`)
    
    // Hedef saat formatını al
    const targetTime = formatDate(inputDate, "HH:mm")
    console.log(`Hedef saat dilimi: ${targetTime}`)
    
    // Günün başlangıç ve bitişini belirle
    const dayStart = startOfDay(inputDate)
    const dayEnd = endOfDay(inputDate)
    
    // Aynı saat ve gün için mevcut kapalı slotları kontrol et
    const existingClosedSlot = await prisma.closedSlot.findFirst({
      where: {
        userId,
        date: {
          gte: dayStart,
          lte: dayEnd
        }
      }
    })
    
    if (existingClosedSlot) {
      const existingTime = formatDate(existingClosedSlot.date, "HH:mm")
      
      if (existingTime === targetTime) {
        console.log(`Bu zaman dilimi zaten kapalı: ${targetTime}`)
        return NextResponse.json({
          message: "Bu zaman dilimi zaten kapalı",
          closedSlot: existingClosedSlot
        })
      }
    }

    // Hedef saati doğru şekilde ayarlayalım
    const slotTime = new Date(dayStart)
    const [hours, minutes] = targetTime.split(":").map(Number)
    slotTime.setHours(hours, minutes, 0, 0)

    // Zaman dilimini kapat
    const closedSlot = await prisma.closedSlot.create({
      data: {
        userId,
        date: slotTime,
        reason,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log(`Kapatılan zaman dilimi: ${formatDate(closedSlot.date, "HH:mm")}`)
    console.log(`Veritabanına yazılan tarih: ${closedSlot.date.toISOString()}`)

    return NextResponse.json(closedSlot)
  } catch (error) {
    console.error("Zaman dilimi kapatılırken hata oluştu:", error)
    return NextResponse.json(
      { error: "Zaman dilimi kapatılamadı" },
      { status: 500 }
    )
  }
} 