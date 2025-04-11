import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

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

    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: new Date(start),
          lte: new Date(end)
        }
      },
      include: {
        user: true
      },
      orderBy: {
        date: 'asc'
      }
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error("Randevular getirilirken hata oluştu:", error)
    return NextResponse.json(
      { error: "Randevular getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
} 