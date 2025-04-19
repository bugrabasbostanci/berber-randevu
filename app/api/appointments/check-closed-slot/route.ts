import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { format, startOfDay, endOfDay, parseISO } from "date-fns"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date")
    const userId = searchParams.get("userId")
    const timeParam = searchParams.get("time") // Saat bilgisini ayrı bir parametre olarak alıyoruz

    if (!dateParam || !userId) {
      return NextResponse.json(
        { error: "Tarih ve kullanıcı ID'si gereklidir" },
        { status: 400 }
      )
    }

    // Tarihi parse et
    const parsedDate = parseISO(dateParam)
    
    // Günün başlangıç ve bitişini belirle
    const dayStart = startOfDay(parsedDate)
    const dayEnd = endOfDay(parsedDate)

    // Eğer belirli bir saat sorgusu varsa
    if (timeParam) {
      // Saat bilgisini al (HH:MM formatında)
      const [hours, minutes] = timeParam.split(":").map(Number)
      
      // Belirli saat için sorgu yap
      const targetTime = new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate(),
        hours,
        minutes
      )
      
      // Tam olarak bu saatteki kapalı slotları ara
      const closedSlot = await prisma.closedSlot.findFirst({
        where: {
          userId: parseInt(userId),
          date: {
            gte: new Date(targetTime.getTime() - 1000 * 60), // 1 dakika tolerans
            lte: new Date(targetTime.getTime() + 1000 * 60)  // 1 dakika tolerans
          }
        }
      })
      
      return NextResponse.json({ 
        isClosed: !!closedSlot,
        reason: closedSlot?.reason || null
      })
    }
    
    // Tüm günün kapalı slotlarını getir
    const closedSlots = await prisma.closedSlot.findMany({
      where: {
        userId: parseInt(userId),
        date: {
          gte: dayStart,
          lte: dayEnd
        }
      }
    })

    // Saatleri formatlayarak frontend'e gönder
    const formattedSlots = closedSlots.map(slot => ({
      id: slot.id,
      userId: slot.userId,
      time: format(slot.date, "HH:mm"),
      reason: slot.reason || null,
      fullDate: slot.date
    }))

    return NextResponse.json(formattedSlots)
  } catch (error) {
    console.error("Kapatılmış saat dilimi kontrolü sırasında hata:", error)
    return NextResponse.json(
      { error: "Kapatılmış saat dilimi kontrolü yapılamadı" },
      { status: 500 }
    )
  }
}