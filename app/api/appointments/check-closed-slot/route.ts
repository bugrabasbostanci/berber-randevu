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

    // Tarih ve saati birleştirin veya ayrı saat parametresi kullanın
    let targetDateTime;
    
    if (timeParam && !dateParam.includes("T")) {
      // Saat bilgisi ayrı geldiyse tarih ve saati birleştir (yyyy-MM-ddTHH:mm formatında)
      targetDateTime = safeParseDate(`${dateParam}T${timeParam}`);
    } else {
      // Tam tarih-saat bilgisi geldiyse direkt kullan
      targetDateTime = safeParseDate(dateParam);
    }
    
    console.log(`Kontrol edilen tarih-saat: ${targetDateTime.toISOString()}`);
    
    // Sorgu için saat ve dakika bilgilerini al
    const hours = targetDateTime.getHours();
    const minutes = targetDateTime.getMinutes();
    
    // Veritabanındaki ilgili tarih-saatte kapanmış slot kontrolü
    const closedSlot = await prisma.closedSlot.findFirst({
      where: {
        userId: parseInt(userId),
        date: {
          // Saat ve dakikanın tam eşleşmesini sağlayarak kontrol et
          // Yıl-ay-gün eşleşmesini ve saat-dakika eşleşmesini sağla
          gte: new Date(
            targetDateTime.getFullYear(),
            targetDateTime.getMonth(),
            targetDateTime.getDate(),
            hours,
            minutes,
            0,
            0
          ),
          lte: new Date(
            targetDateTime.getFullYear(),
            targetDateTime.getMonth(),
            targetDateTime.getDate(),
            hours,
            minutes,
            59,
            999
          )
        }
      }
    });
    
    console.log(`Kapalı slot kontrolü sonucu: ${!!closedSlot ? "Kapalı" : "Açık"}`);
    
    return NextResponse.json({ 
      isClosed: !!closedSlot,
      reason: closedSlot?.reason || null
    });
  } catch (error) {
    console.error("Kapatılmış saat dilimi kontrolü sırasında hata:", error)
    return NextResponse.json(
      { error: "Kapatılmış saat dilimi kontrolü yapılamadı" },
      { status: 500 }
    )
  }
}