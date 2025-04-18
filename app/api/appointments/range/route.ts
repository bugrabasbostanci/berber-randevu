import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { safeParseDate, formatDatesForApi } from "@/lib/utils"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    if (!start || !end) {
      return NextResponse.json(
        { error: "Başlangıç ve bitiş tarihleri gereklidir" },
        { status: 400 }
      )
    }

    // Tutarlı şekilde tarihleri işle
    const startDate = safeParseDate(start)
    const endDate = safeParseDate(end)

    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        user: true
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Tutarlı formatta tarih dönüşümü
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