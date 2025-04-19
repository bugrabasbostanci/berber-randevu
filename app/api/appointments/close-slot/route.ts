import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay, safeParseDate, formatTimeFromDate, createLocalDatetime } from "@/lib/utils"

export async function POST(request: Request) {
  try {
    // Gelen veriler
    const { userId, date, time, reason } = await request.json()
    
    // Tarih değerini işle ve parçala
    const dateObj = typeof date === 'string' && !date.includes('T') 
      ? safeParseDate(date) 
      : safeParseDate(date);
    
    // Yıl, ay, gün bilgilerini al
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1; // JavaScript'te ay 0-11 arası, biz 1-12 kullanıyoruz
    const day = dateObj.getDate();
    
    // Saat ve dakika bilgilerini al
    let hours = 0, minutes = 0;
    
    if (time) {
      // HH:MM formatında gelen saat
      [hours, minutes] = time.split(':').map(Number);
    } else {
      // Tarih+saat birlikte geldiyse
      hours = dateObj.getHours();
      minutes = dateObj.getMinutes();
    }
    
    // Kapatılacak slotun tam tarihini yerel saat olarak oluştur
    const targetDateTime = createLocalDatetime(year, month, day, hours, minutes, 0, 0);
    
    // Günün başlangıç ve bitişini belirle
    const dayStart = startOfDay(targetDateTime);
    const dayEnd = endOfDay(targetDateTime);
    
    // Formatlanmış saat (HH:MM)
    const targetTimeFormatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    console.log(`Kapatılacak saat dilimi: ${targetTimeFormatted}`);
    
    // Aynı gün için mevcut kapalı slotları kontrol et
    const existingClosedSlots = await prisma.closedSlot.findMany({
      where: {
        userId: parseInt(userId.toString()),
        date: {
          gte: dayStart,
          lte: dayEnd
        }
      }
    });
    
    // Her bir slot için saat karşılaştırması yap
    for (const slot of existingClosedSlots) {
      const slotHour = slot.date.getHours();
      const slotMinute = slot.date.getMinutes();
      const slotTime = `${slotHour.toString().padStart(2, '0')}:${slotMinute.toString().padStart(2, '0')}`;
      
      if (slotTime === targetTimeFormatted) {
        console.log(`Bu zaman dilimi zaten kapalı: ${targetTimeFormatted}`);
        return NextResponse.json({
          message: "Bu zaman dilimi zaten kapalı",
          closedSlot: slot
        });
      }
    }

    // Zaman dilimini kapat (tamamen yerel saat kullanarak)
    const closedSlot = await prisma.closedSlot.create({
      data: {
        userId: parseInt(userId.toString()),
        date: targetDateTime, // Yerel saat
        reason: reason || null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log(`Kapatılan zaman dilimi: ${formatTimeFromDate(closedSlot.date)}`);
    console.log(`Kapalı slot ID: ${closedSlot.id}`);

    return NextResponse.json({
      id: closedSlot.id,
      userId: closedSlot.userId,
      date: closedSlot.date.toISOString(),
      time: formatTimeFromDate(closedSlot.date),
      reason: closedSlot.reason
    });
  } catch (error) {
    console.error("Zaman dilimi kapatılırken hata oluştu:", error);
    return NextResponse.json(
      { error: "Zaman dilimi kapatılamadı" },
      { status: 500 }
    );
  }
} 