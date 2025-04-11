import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Mevcut randevuları getir
    const appointments = await prisma.appointment.findMany({
      orderBy: {
        date: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      count: appointments.length,
      appointments: appointments
    })
  } catch (error) {
    console.error("Randevular kontrol edilirken hata oluştu:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Bilinmeyen hata"
    }, { status: 500 })
  }
} 