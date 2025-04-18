import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay, formatDate, safeParseDate, setTimeToDate, formatDatesForApi } from "@/lib/utils"
import { DATE_FORMAT } from "@/lib/utils"

export async function POST(request: Request) {
  try {
    const { userId, date, reason } = await request.json()
    
    // Gelen tarihi güvenli bir şekilde işle
    const inputDate = typeof date === 'string' ? safeParseDate(date) : date
    console.log(`Gelen tarih: ${inputDate.toISOString()}`)
    
    // Hedef saat formatını al
    const targetTime = formatDate(inputDate, DATE_FORMAT.ISO_TIME)
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
      const existingTime = formatDate(existingClosedSlot.date, DATE_FORMAT.ISO_TIME)
      
      if (existingTime === targetTime) {
        console.log(`Bu zaman dilimi zaten kapalı: ${targetTime}`)
        return NextResponse.json({
          message: "Bu zaman dilimi zaten kapalı",
          closedSlot: formatDatesForApi(existingClosedSlot)
        })
      }
    }

    // Hedef saat dilimini doğru şekilde ayarlayalım
    const [hours, minutes] = targetTime.split(":").map(Number)
    const slotTime = setTimeToDate(dayStart, hours, minutes)

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

    console.log(`Kapatılan zaman dilimi: ${formatDate(closedSlot.date, DATE_FORMAT.ISO_TIME)}`)
    console.log(`Veritabanına yazılan tarih: ${closedSlot.date.toISOString()}`)

    return NextResponse.json(formatDatesForApi(closedSlot))
  } catch (error) {
    console.error("Zaman dilimi kapatılırken hata oluştu:", error)
    return NextResponse.json(
      { error: "Zaman dilimi kapatılamadı" },
      { status: 500 }
    )
  }
} 