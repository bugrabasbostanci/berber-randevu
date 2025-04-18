import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay } from "date-fns"
import { formatDate, safeParseDate } from "@/lib/utils"

export async function POST(request: Request) {
  try {
    const { userId, date, reason } = await request.json()
    
    // Gelen tarihi doğru şekilde işle
    const inputDate = typeof date === 'string' ? date : date.toISOString()
    console.log(`Alınan ham tarih: ${inputDate}`)
    
    // Tarihi güvenli bir şekilde parse et
    const parsedDate = safeParseDate(inputDate)
    
    // Günün başlangıç ve bitişini ayarla
    const dayStart = startOfDay(parsedDate)
    const dayEnd = endOfDay(parsedDate)
    
    console.log(`Günün başlangıcı: ${formatDate(dayStart, "yyyy-MM-dd HH:mm:ss")}`)
    console.log(`Günün bitişi: ${formatDate(dayEnd, "yyyy-MM-dd HH:mm:ss")}`)

    // Önce mevcut kapalı zaman dilimlerini kontrol et
    const existingClosedSlots = await prisma.closedSlot.findMany({
      where: {
        userId,
        date: {
          gte: dayStart,
          lte: dayEnd
        }
      }
    })

    console.log(`Mevcut kapalı zaman dilimi sayısı: ${existingClosedSlots.length}`)

    // Sabit zaman dilimlerini tanımla
    const workingSlots = [
      { hour: 9, minute: 30 },   // 09:30
      { hour: 10, minute: 15 },  // 10:15
      { hour: 11, minute: 0 },   // 11:00
      { hour: 11, minute: 45 },  // 11:45
      { hour: 12, minute: 30 },  // 12:30
      { hour: 13, minute: 15 },  // 13:15
      { hour: 14, minute: 0 },   // 14:00
      { hour: 14, minute: 45 },  // 14:45
      { hour: 15, minute: 30 },  // 15:30
      { hour: 16, minute: 15 },  // 16:15
      { hour: 17, minute: 0 },   // 17:00
      { hour: 17, minute: 45 },  // 17:45
      { hour: 18, minute: 30 },  // 18:30
      { hour: 19, minute: 15 },  // 19:15
      { hour: 20, minute: 0 },   // 20:00
      { hour: 20, minute: 45 }   // 20:45
    ]

    // Yeni kapatılacak zaman dilimlerini oluştur
    const newClosedSlots = []

    for (const slot of workingSlots) {
      // Her zaman dilimi için yeni bir tarih nesnesi oluştur
      const slotDate = new Date(dayStart)
      slotDate.setHours(slot.hour, slot.minute, 0, 0)

      // Oluşturulan zaman diliminin saatini formatla
      const formattedSlotTime = formatDate(slotDate, "HH:mm")
      console.log(`İşlenen zaman dilimi: ${formattedSlotTime}`)
      
      // Eğer bu slot zaten kapalı değilse ekle
      const isAlreadyClosed = existingClosedSlots.some(existing => {
        // Mevcut kapalı slot'un saatini kontrol et
        const existingTime = formatDate(existing.date, "HH:mm")
        console.log(`Karşılaştırma: mevcut=${existingTime}, yeni=${formattedSlotTime}`)
        return existingTime === formattedSlotTime
      })
      
      if (!isAlreadyClosed) {
        console.log(`Yeni kapatılacak zaman dilimi: ${formattedSlotTime}`)
        newClosedSlots.push({
          userId,
          date: slotDate,
          reason,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
    }

    // Sadece yeni zaman dilimlerini ekle
    if (newClosedSlots.length > 0) {
      console.log(`${newClosedSlots.length} yeni zaman dilimi kapatılacak:`)
      newClosedSlots.forEach(slot => {
        console.log(`- ${formatDate(slot.date, "HH:mm")}`)
      })
      
      try {
        const closedSlots = await prisma.closedSlot.createMany({
          data: newClosedSlots
        })
        
        console.log(`DB eklenen sonuç: ${JSON.stringify(closedSlots)}`)

        return NextResponse.json({
          message: `${newClosedSlots.length} zaman dilimi kapatıldı`,
          closedSlots
        })
      } catch (dbError) {
        console.error("Veritabanı işleminde hata:", dbError)
        return NextResponse.json(
          { error: "Veritabanına zaman dilimleri eklenirken hata oluştu" },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      message: "Tüm zaman dilimleri zaten kapalı"
    })
  } catch (error) {
    console.error("Gün kapatılırken hata oluştu:", error)
    return NextResponse.json(
      { error: "Gün kapatılamadı" },
      { status: 500 }
    )
  }
} 