import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const userId = searchParams.get("userId")

    if (!date || !userId) {
      return NextResponse.json(
        { error: "Tarih ve kullanıcı ID'si gereklidir" },
        { status: 400 }
      )
    }

    const isClosed = await prisma.closedSlot.findFirst({
      where: {
        userId: parseInt(userId),
        date: new Date(date)
      }
    })

    return NextResponse.json({ isClosed: !!isClosed })
  } catch (error) {
    console.error("Kapatılmış saat dilimi kontrolü sırasında hata:", error)
    return NextResponse.json(
      { error: "Kapatılmış saat dilimi kontrolü yapılamadı" },
      { status: 500 }
    )
  }
} 