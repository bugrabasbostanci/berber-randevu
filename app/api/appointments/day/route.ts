import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay, formatDatesForApi } from "@/lib/utils"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    if (!date) {
      return NextResponse.json(
        { error: "Tarih gereklidir" },
        { status: 400 }
      )
    }

    // Tutarlı şekilde günün başlangıç ve bitiş saatlerini belirle
    const start = startOfDay(date)
    const end = endOfDay(date)

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