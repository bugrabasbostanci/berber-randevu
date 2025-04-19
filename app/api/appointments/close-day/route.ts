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
    
    console.log(`Mevcut kapalı slot sayısı: ${existingClosedSlots.length}`)
    
    // Kapalı slot saatlerini set olarak tut (performans için)
    const existingClosedHours = new Set(
      existingClosedSlots.map(slot => formatDate(slot.date, "HH:mm"))
    )
    
    console.log(`Kapalı saatler: ${Array.from(existingClosedHours).join(', ')}`)
    
    // Kapatılacak yeni slotları oluştur
    const newClosedSlots = []
    
    for (const slot of WORKING_SLOTS) {
      // Slot için tarih oluştur - Zaman dilimi sorunlarına dikkat et
      // UTC zamanını koruyarak slot tarihi oluştur
      const slotDate = new Date(Date.UTC(
        dayStart.getFullYear(),
        dayStart.getMonth(),
        dayStart.getDate(),
        slot.hour,
        slot.minute,
        0,
        0
      ));
      
      // Saat formatını al (UTC olarak)
      const slotTime = formatDate(slotDate, "HH:mm");
      
      // Daha detaylı debug bilgisi ekle
      console.log(`Kontrol edilen slot: ${slotTime}, Tarih (ISO): ${slotDate.toISOString()}, Tarih (Local): ${slotDate.toString()}`);
      console.log(`UTC: Saat=${slotDate.getUTCHours()}, Dakika=${slotDate.getUTCMinutes()}`);
      console.log(`Yerel: Saat=${slotDate.getHours()}, Dakika=${slotDate.getMinutes()}`);
      
      // Eğer bu saat zaten kapalı değilse, kapatılacaklar listesine ekle
      if (!existingClosedHours.has(slotTime)) {
        newClosedSlots.push({
          userId,
          date: slotDate,
          reason: reason || 'Berber/Çalışan tarafından kapatıldı',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
    
    console.log(`Kapatılacak yeni slot sayısı: ${newClosedSlots.length}`)
    console.log(`Çalışma saati sayısı: ${WORKING_SLOTS.length}`)
    
    // Eğer eklenecek yeni slot yoksa ve mevcut kapalı slot sayısı toplam slot sayısından azsa,
    // bir hata var demektir, bu durumda kullanıcıya uygun mesaj göster
    if (newClosedSlots.length === 0) {
      if (existingClosedSlots.length < WORKING_SLOTS.length) {
        console.log(`Uyarı: Kapatılacak yeni slot yok, ancak mevcut kapalı slot sayısı (${existingClosedSlots.length}) toplam slot sayısından (${WORKING_SLOTS.length}) az.`)
        
        // Mevcut slotları temizle ve tümünü yeniden oluştur
        await prisma.closedSlot.deleteMany({
          where: {
            userId,
            date: {
              gte: dayStart,
              lte: dayEnd
            }
          }
        })
        
        // Tüm slotları yeniden oluştur
        const allSlots = WORKING_SLOTS.map(slot => {
          const slotDate = new Date(Date.UTC(
            dayStart.getFullYear(),
            dayStart.getMonth(),
            dayStart.getDate(),
            slot.hour,
            slot.minute,
            0,
            0
          ));
          
          console.log(`Yeniden oluşturulan slot: Saat=${slot.hour}:${slot.minute}, UTC Tarih=${slotDate.toISOString()}`);
          
          return {
            userId,
            date: slotDate,
            reason: reason || 'Berber/Çalışan tarafından kapatıldı',
            createdAt: new Date(),
            updatedAt: new Date()
          };
        });
        
        const createdSlots = await prisma.closedSlot.createMany({
          data: allSlots
        })
        
        return NextResponse.json({
          message: `Tüm zaman dilimleri yeniden kapatıldı (${createdSlots.count} slot)`,
          closedCount: createdSlots.count
        })
      } else {
        return NextResponse.json({
          message: "Tüm zaman dilimleri zaten kapalı"
        })
      }
    }
    
    // Yeni slotları ekle
    const closedSlots = await prisma.closedSlot.createMany({
      data: newClosedSlots
    })
    
    console.log(`Veritabanına ${closedSlots.count} adet kapalı slot başarıyla eklendi.`)
    
    // İşlem sonrası, veritabanında bu gün için bu kullanıcıya ait tüm kapalı slotları kontrol et
    const currentClosedSlots = await prisma.closedSlot.findMany({
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
    
    console.log(`İşlem sonrası veritabanında ${currentClosedSlots.length} adet slot bulunuyor.`)
    
    return NextResponse.json({
      message: `${newClosedSlots.length} zaman dilimi kapatıldı`,
      closedCount: closedSlots.count,
      totalClosedCount: currentClosedSlots.length
    })
  } catch (error) {
    console.error("Gün kapatılırken hata oluştu:", error)
    return NextResponse.json(
      { error: "Gün kapatılamadı" },
      { status: 500 }
    )
  }
} 