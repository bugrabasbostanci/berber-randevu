import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
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
    console.log(`Formatlanmış tarih: ${formatDate(inputDate, "yyyy-MM-dd HH:mm:ss")}`)


    // Yeni bir tarih nesnesi oluşturup sadece saat ve dakika bilgisi atayelım
    const normalizedDate = new Date(inputDate)
    normalizedDate.setSeconds(0, 0) // Saniyeleri ve milisaniyeleri sıfırla

    console.log(`Normalize edilmiş tarih: ${normalizedDate.toISOString()}`)
    console.log(`Normalize edilmiş saat: ${formatDate(normalizedDate, "HH:mm")}`)

    // Zaman dilimini kapat
    const closedSlot = await prisma.closedSlot.create({
      data: {
        userId,
        date: normalizedDate,
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