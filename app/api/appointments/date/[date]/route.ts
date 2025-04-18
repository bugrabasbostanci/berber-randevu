import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay, formatDatesForApi } from "@/lib/utils"

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

    // Tutarlı şekilde günün başlangıç ve bitiş saatlerini belirle
    const start = startOfDay(dateParam)
    const end = endOfDay(dateParam)

    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    // Tarihleri tutarlı bir şekilde formatla
    const formattedAppointments = appointments.map(appointment => 
      formatDatesForApi(appointment)
    )

    return NextResponse.json(formattedAppointments)
  } catch (error) {
    console.error("Randevular getirilirken hata oluştu:", error)
    return NextResponse.json(
      { error: "Randevular getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
} 