import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // URL'den tarih parametresini alalım
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const dateParam = pathParts[pathParts.length - 1]
    
    if (!dateParam) {
      return NextResponse.json(
        { error: "Tarih gereklidir" },
        { status: 400 }
      )
    }

    const startOfDay = new Date(dateParam)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(dateParam)
    endOfDay.setHours(23, 59, 59, 999)

    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    // Tarihleri string formatına dönüştür
    const formattedAppointments = appointments.map(appointment => ({
      ...appointment,
      date: appointment.date.toISOString(),
      createdAt: appointment.createdAt?.toISOString(),
      updatedAt: appointment.updatedAt?.toISOString()
    }))

    return NextResponse.json(formattedAppointments)
  } catch (error) {
    console.error("Randevular getirilirken hata oluştu:", error)
    return NextResponse.json(
      { error: "Randevular getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
} 