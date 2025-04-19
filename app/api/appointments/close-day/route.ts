import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay } from "date-fns"
import { formatDate } from "@/lib/utils"
import { WORKING_SLOTS } from "@/components/calendar/features/day-view/utils/day-view-utils"

export async function POST(request: Request) {
  try {
    const { userId, date, reason } = await request.json()
    
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
    
    // Günün başlangıç ve bitişini ayarla
    const dayStart = startOfDay(parsedDate)
    const dayEnd = endOfDay(parsedDate)
    
    // Log ekleme
    console.log(`Gün kapatma isteği - Kullanıcı: ${userId}, Tarih: ${formatDate(dayStart, "yyyy-MM-dd")}`)
    
    // Önce mevcut kapalı zaman dilimlerini getir
    const existingClosedSlots = await prisma.closedSlot.findMany({
      where: {
        userId,
        date: {
          gte: dayStart,
          lte: dayEnd
        }
      },
      select: {
        date: true
      }
    })
    
    // Kapalı slot saatlerini set olarak tut (performans için)
    const existingClosedHours = new Set(
      existingClosedSlots.map(slot => formatDate(slot.date, "HH:mm"))
    )
    
    // Kapatılacak yeni slotları oluştur
    const newClosedSlots = []
    
    for (const slot of WORKING_SLOTS) {
      // Slot için tarih oluştur
      const slotDate = new Date(dayStart)
      slotDate.setHours(slot.hour, slot.minute, 0, 0)
      
      // Saat formatını al
      const slotTime = formatDate(slotDate, "HH:mm")
      
      // Eğer bu saat zaten kapalı değilse, kapatılacaklar listesine ekle
      if (!existingClosedHours.has(slotTime)) {
        newClosedSlots.push({
          userId,
          date: slotDate,
          reason: reason || 'Berber/Çalışan tarafından kapatıldı',
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
    }
    
    // Eğer eklenecek yeni slot yoksa, mesaj döndür
    if (newClosedSlots.length === 0) {
      return NextResponse.json({
        message: "Tüm zaman dilimleri zaten kapalı"
      })
    }
    
    // Yeni slotları ekle
    const closedSlots = await prisma.closedSlot.createMany({
      data: newClosedSlots
    })
    
    return NextResponse.json({
      message: `${newClosedSlots.length} zaman dilimi kapatıldı`,
      closedCount: closedSlots.count
    })
  } catch (error) {
    console.error("Gün kapatılırken hata oluştu:", error)
    return NextResponse.json(
      { error: "Gün kapatılamadı" },
      { status: 500 }
    )
  }
} 