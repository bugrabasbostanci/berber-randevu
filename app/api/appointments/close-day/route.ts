import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay } from "date-fns"

export async function POST(request: Request) {
  try {
    const { userId, date, reason } = await request.json()
    const dayStart = startOfDay(new Date(date))
    const dayEnd = endOfDay(new Date(date))

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

    // Çalışma saatleri: 09:30 - 21:00, 45 dakikalık aralıklarla
    const WORKING_HOURS = {
      start: 9.5, // 09:30
      end: 21,    // 21:00
      interval: 0.75 // 45 dakika
    }

    // Yeni kapatılacak zaman dilimlerini oluştur
    const newClosedSlots = []
    let currentTime = WORKING_HOURS.start

    while (currentTime < WORKING_HOURS.end) {
      const hours = Math.floor(currentTime)
      const minutes = Math.round((currentTime % 1) * 60)
      
      const slotDate = new Date(dayStart)
      slotDate.setHours(hours, minutes, 0, 0)

      // Eğer bu slot zaten kapalı değilse ekle
      if (!existingClosedSlots.some(
        existing => existing.date.getTime() === slotDate.getTime()
      )) {
        newClosedSlots.push({
          userId,
          date: slotDate,
          reason,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
      
      currentTime += WORKING_HOURS.interval
    }

    // Sadece yeni zaman dilimlerini ekle
    if (newClosedSlots.length > 0) {
      const closedSlots = await prisma.closedSlot.createMany({
        data: newClosedSlots
      })

      return NextResponse.json({
        message: `${newClosedSlots.length} zaman dilimi kapatıldı`,
        closedSlots
      })
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