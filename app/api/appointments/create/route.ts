import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { safeParseDate, formatDatesForApi } from "@/lib/utils"

export async function POST(request: Request) {
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
    const { customerName, customerSurname, date, service, phone } = body

    // Gerekli alanları kontrol et
    if (!customerName || !customerSurname || !date || !service || !phone) {
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

    // Kullanıcı ID'sini alın (oturum açmış kullanıcı veya varsayılan değer)
    const userId = session.user.id ? parseInt(session.user.id) : 1

    // Randevuyu oluştur
    const appointment = await prisma.appointment.create({
      data: {
        fullname: `${customerName} ${customerSurname}`,
        date: appointmentDate,
        phone,
        userId: userId,
      }
    })

    // API yanıtında tarihleri tutarlı bir formatta döndür
    return NextResponse.json({
      success: true,
      message: "Randevu başarıyla oluşturuldu",
      appointment: formatDatesForApi(appointment)
    })

  } catch (error) {
    console.error("Randevu oluşturulurken hata oluştu:", error)
    return NextResponse.json(
      { error: "Randevu oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
} 