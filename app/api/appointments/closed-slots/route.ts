import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay, formatDatesForApi } from "@/lib/utils"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    if (!date) {
      return NextResponse.json(
        { error: "Tarih parametresi gerekli" },
        { status: 400 }
      )
    }

    const start = startOfDay(date)
    const end = endOfDay(date)

    const closedSlots = await prisma.closedSlot.findMany({
      where: {
        date: {
          gte: start,
          lte: end
        }
      },
      include: {
        user: true
      }
    })

    const formattedClosedSlots = closedSlots.map(slot => 
      formatDatesForApi(slot)
    )

    return NextResponse.json(formattedClosedSlots)
  } catch (error) {
    console.error("Kapatılan zaman dilimleri getirilirken hata oluştu:", error)
    return NextResponse.json(
      { error: "Kapatılan zaman dilimleri getirilemedi" },
      { status: 500 }
    )
  }
} 