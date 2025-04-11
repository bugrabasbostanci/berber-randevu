import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Veritabanı bağlantısını test et
    await prisma.$connect()
    
    // Toplam randevu sayısını al
    const count = await prisma.appointment.count()
    
    // Son 5 randevuyu al
    const recentAppointments = await prisma.appointment.findMany({
      take: 5,
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      message: "Veritabanı bağlantısı başarılı",
      count,
      recentAppointments: recentAppointments.map(appointment => ({
        ...appointment,
        date: appointment.date.toISOString(),
        createdAt: appointment.createdAt?.toISOString(),
        updatedAt: appointment.updatedAt?.toISOString()
      }))
    })
  } catch (error) {
    console.error("Veritabanı bağlantı hatası:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Bilinmeyen hata"
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 