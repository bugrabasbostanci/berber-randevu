import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay, formatDatesForApi, safeParseDate } from "@/lib/utils"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    if (!date) {
      return NextResponse.json(
        { error: "Tarih parametresi gerekli" },
        { status: 400 }
      )
    }

    console.log(`Kapalı slotlar için gelen tarih: ${date}`)
    
    const dateObj = safeParseDate(date)
    console.log(`Ayrıştırılan tarih nesnesi: ${dateObj.toISOString()}`)
    
    const start = startOfDay(dateObj)
    const end = endOfDay(dateObj)
    
    console.log(`Günün başlangıcı: ${start.toISOString()}`)
    console.log(`Günün sonu: ${end.toISOString()}`)

    const closedSlots = await prisma.closedSlot.findMany({
      where: {
        date: {
          gte: start,
          lte: end
        }
      },
      include: {
        user: true
      }
    })

    console.log(`Veritabanından getirilen kapalı slot sayısı: ${closedSlots.length}`)
    
    if (closedSlots.length > 0) {
      closedSlots.forEach(slot => {
        console.log(`Kapalı slot - Kullanıcı: ${slot.userId}, Tarih: ${slot.date.toISOString()}`)
      })
    }

    const formattedClosedSlots = closedSlots.map(slot => 
      formatDatesForApi(slot)
    )

    return NextResponse.json(formattedClosedSlots)
  } catch (error) {
    console.error("Kapatılan zaman dilimleri getirilirken hata oluştu:", error)
    return NextResponse.json(
      { error: "Kapatılan zaman dilimleri getirilemedi" },
      { status: 500 }
    )
  }
} 