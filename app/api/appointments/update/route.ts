import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { safeParseDate, formatDatesForApi } from "@/lib/utils"

export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    // Kullanıcı giriş yapmamışsa veya yetkisi yoksa hata döndür
    if (!session?.user) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmanız gerekiyor" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, fullname, date, phone } = body

    // Gerekli alanları kontrol et
    if (!id || !fullname || !date || !phone) {
      return NextResponse.json(
        { error: "Tüm alanları doldurunuz" },
        { status: 400 }
      )
    }

    // Randevu tarihini güvenli bir şekilde ayrıştır
    const appointmentDate = safeParseDate(date)
    if (isNaN(appointmentDate.getTime())) {
      return NextResponse.json(
        { error: "Geçersiz tarih" },
        { status: 400 }
      )
    }

    // Randevuyu güncelle
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        fullname,
        date: appointmentDate,
        phone
      }
    })

    // API yanıtında tarihleri tutarlı bir formatta döndür
    return NextResponse.json({
      success: true,
      message: "Randevu başarıyla güncellendi",
      appointment: formatDatesForApi(appointment)
    })

  } catch (error) {
    console.error("Randevu güncellenirken hata oluştu:", error)
    return NextResponse.json(
      { error: "Randevu güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
} 