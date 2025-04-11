import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sampleAppointments } from "@/lib/data"

export async function POST() {
  try {
    // Önce mevcut randevuları temizle
    await prisma.appointment.deleteMany()

    // Örnek randevuları ekle
    const createdAppointments = await Promise.all(
      sampleAppointments.map(appointment => 
        prisma.appointment.create({
          data: {
            fullname: appointment.fullname,
            date: appointment.date,
            phone: appointment.phone
          }
        })
      )
    )

    return NextResponse.json({
      success: true,
      message: `${createdAppointments.length} randevu başarıyla eklendi`,
      appointments: createdAppointments
    })
  } catch (error) {
    console.error("Randevular eklenirken hata oluştu:", error)
    return NextResponse.json({
      success: false,
      message: "Randevular eklenirken bir hata oluştu",
      error: error instanceof Error ? error.message : "Bilinmeyen hata"
    }, { status: 500 })
  }
} 