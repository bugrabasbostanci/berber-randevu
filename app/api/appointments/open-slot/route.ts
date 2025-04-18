import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay } from "date-fns"
import { formatDate, safeParseDate } from "@/lib/utils"

export async function POST(request: Request) {
  try {
    const { userId, date } = await request.json()
    
    // Gelen tarihi güvenli bir şekilde işle
    const rawDate = typeof date === 'string' ? date : date.toISOString()
    console.log(`Zaman dilimi açma - Gelen tarih: ${rawDate}`)
    
    // Tarihi parse et
    const inputDate = safeParseDate(rawDate)
    console.log(`Zaman dilimi açma - Oluşturulan tarih: ${inputDate.toISOString()}`)
    console.log(`Zaman dilimi açma - Formatlanmış: ${formatDate(inputDate, "yyyy-MM-dd HH:mm:ss")}`)
    
    // Saat bilgisini alalım
    const targetTime = formatDate(inputDate, "HH:mm")
    console.log(`Hedef zaman dilimi: ${targetTime}`)
    
    // O günün başlangıç ve bitişini hesaplama
    const dayStart = startOfDay(inputDate)
    const dayEnd = endOfDay(inputDate)
    
    // O gün içinde belirtilen saate sahip tüm kapalı slotları bul ve sil
    const deletedSlots = await prisma.closedSlot.deleteMany({
      where: {
        userId,
        date: {
          gte: dayStart,
          lte: dayEnd
        },
        // Tarih nesnesi için saat formatını kontrol edeceğiz
        AND: {
          date: {
            // Raw SQL sorgusu ile saat karşılaştırması (veritabanı uyumlu)
            equals: inputDate
          }
        }
      }
    })

    console.log(`Silinen zaman dilimi sayısı: ${deletedSlots.count}`)
    
    // Silinen zaman dilimi yoksa spesifik saati bulmak için bir kez daha deneyelim
    if (deletedSlots.count === 0) {
      console.log("Tam eşleşme bulunamadı, saat formatıyla eşleşenleri arıyoruz...")
      
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
        const slotTime = formatDate(slot.date, "HH:mm")
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
    }

    return NextResponse.json({
      message: `${deletedSlots.count} zaman dilimi açıldı`,
      count: deletedSlots.count
    })
  } catch (error) {
    console.error("Zaman dilimi açılırken hata oluştu:", error)
    return NextResponse.json(
      { error: "Zaman dilimi açılamadı" },
      { status: 500 }
    )
  }
} 