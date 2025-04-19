import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { safeParseDate } from "@/lib/utils"

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

    // Tarih değerini işle
    const dateObj = safeParseDate(dateParam);
    
    // Yıl, ay, gün bilgilerini al
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1; // JavaScript'te ay 0-11 arası, biz 1-12 kullanıyoruz
    const day = dateObj.getDate();
    
    // Saat ve dakika bilgilerini al
    let hours = 0, minutes = 0;
    
    if (timeParam) {
      // HH:MM formatında gelen saat
      [hours, minutes] = timeParam.split(':').map(Number);
    } else if (dateParam.includes('T')) {
      // Tarih+saat birlikte geldiyse
      hours = dateObj.getHours();
      minutes = dateObj.getMinutes();
    }
    
    
    // Günün başlangıç ve bitişini belirle
    const dayStart = new Date(year, month - 1, day, 0, 0, 0);
    const dayEnd = new Date(year, month - 1, day, 23, 59, 59);
    
    // Formatlanmış saat (HH:MM) - bu saat aranacak
    const timeToCheck = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    // Aynı gün için tüm kapalı slotları getir
    const closedSlots = await prisma.closedSlot.findMany({
      where: {
        userId: parseInt(userId),
        date: {
          gte: dayStart,
          lte: dayEnd
        }
      }
    });
    
    // Sonuçları kontrol et
    let matchFound = false;
    let matchReason = null;
    let matchId = null;

    // Her bir slot için saat karşılaştırması
    for (const slot of closedSlots) {
      const slotHour = slot.date.getHours();
      const slotMinute = slot.date.getMinutes();
      const slotTime = `${slotHour.toString().padStart(2, '0')}:${slotMinute.toString().padStart(2, '0')}`;
      
      if (slotTime === timeToCheck) {
        matchFound = true;
        matchReason = slot.reason;
        matchId = slot.id;
        break;
      }
    }
    
    return NextResponse.json({ 
      isClosed: matchFound,
      reason: matchReason,
      slotId: matchId,
      requestedTime: timeToCheck
    });
  } catch (error) {
    console.error("Kapatılmış saat dilimi kontrolü sırasında hata:", error)
    return NextResponse.json(
      { error: "Kapatılmış saat dilimi kontrolü yapılamadı" },
      { status: 500 }
    )
  }
}