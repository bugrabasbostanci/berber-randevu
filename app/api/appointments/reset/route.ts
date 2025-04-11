import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { addDays, setHours, setMinutes } from "date-fns"

export async function POST() {
  try {
    // Tüm randevuları sil
    await prisma.appointment.deleteMany()
    console.log("Tüm randevular silindi")

    // Yeni örnek randevular oluştur
    const sampleAppointments = [
      // 15 Nisan 2025
      {
        customerName: "Ahmet",
        customerSurname: "Yılmaz",
        date: setMinutes(setHours(addDays(new Date(2025, 3, 15), 0), 10), 0),
        service: "Saç Kesimi",
        status: "confirmed",
        phone: "5551234567"
      },
      {
        customerName: "Mehmet",
        customerSurname: "Kaya",
        date: setMinutes(setHours(addDays(new Date(2025, 3, 15), 0), 11), 0),
        service: "Sakal Tıraşı",
        status: "confirmed",
        phone: "5552345678"
      },
      // 16 Nisan 2025
      {
        customerName: "Ayşe",
        customerSurname: "Demir",
        date: setMinutes(setHours(addDays(new Date(2025, 3, 16), 0), 14), 0),
        service: "Saç Kesimi",
        status: "confirmed",
        phone: "5553456789"
      },
      {
        customerName: "Fatma",
        customerSurname: "Şahin",
        date: setMinutes(setHours(addDays(new Date(2025, 3, 16), 0), 15), 0),
        service: "Saç Boyama",
        status: "confirmed",
        phone: "5554567890"
      },
      // 17 Nisan 2025
      {
        customerName: "Ali",
        customerSurname: "Öztürk",
        date: setMinutes(setHours(addDays(new Date(2025, 3, 17), 0), 10), 0),
        service: "Sakal Tıraşı",
        status: "confirmed",
        phone: "5555678901"
      },
      {
        customerName: "Veli",
        customerSurname: "Çelik",
        date: setMinutes(setHours(addDays(new Date(2025, 3, 17), 0), 11), 0),
        service: "Saç Kesimi",
        status: "confirmed",
        phone: "5556789012"
      },
      // 18 Nisan 2025
      {
        customerName: "Zeynep",
        customerSurname: "Yıldız",
        date: setMinutes(setHours(addDays(new Date(2025, 3, 18), 0), 14), 0),
        service: "Saç Boyama",
        status: "confirmed",
        phone: "5557890123"
      },
      {
        customerName: "Elif",
        customerSurname: "Aydın",
        date: setMinutes(setHours(addDays(new Date(2025, 3, 18), 0), 15), 0),
        service: "Saç Kesimi",
        status: "confirmed",
        phone: "5558901234"
      }
    ]

    // Yeni randevuları ekle
    const createdAppointments = await prisma.appointment.createMany({
      data: sampleAppointments
    })

    return NextResponse.json({
      success: true,
      message: "Randevular başarıyla sıfırlandı ve yeni örnek randevular eklendi",
      count: createdAppointments.count
    })

  } catch (error) {
    console.error("Randevular sıfırlanırken hata oluştu:", error)
    return NextResponse.json(
      { success: false, error: "Randevular sıfırlanırken bir hata oluştu" },
      { status: 500 }
    )
  }
} 