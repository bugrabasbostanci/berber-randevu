import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay } from "date-fns"
import { formatDate, safeParseDate } from "@/lib/utils"
import { WORKING_SLOTS } from "@/components/calendar/features/day-view/utils/day-view-utils"

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

    // Uygulama genelinde tanımlanmış sabit zaman dilimlerini kullan
    // Yeni kapatılacak zaman dilimlerini oluştur
    const newClosedSlots = []

    for (const slot of WORKING_SLOTS) {
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