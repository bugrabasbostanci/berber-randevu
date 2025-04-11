import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { userId, date, reason } = await request.json()

    // Zaman dilimini kapat
    const closedSlot = await prisma.closedSlot.create({
      data: {
        userId,
        date: new Date(date),
        reason,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json(closedSlot)
  } catch (error) {
    console.error("Zaman dilimi kapatılırken hata oluştu:", error)
    return NextResponse.json(
      { error: "Zaman dilimi kapatılamadı" },
      { status: 500 }
    )
  }
} 