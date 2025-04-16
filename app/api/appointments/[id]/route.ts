import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const appointment = await prisma.appointment.delete({
      where: { id }
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error("Randevu silinirken hata oluştu:", error)
    return NextResponse.json(
      { error: "Randevu silinemedi" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        fullname: data.fullname,
        date: new Date(data.date),
        phone: data.phone,
        userId: data.userId
      },
      include: {
        user: true
      }
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error("Randevu güncellenirken hata oluştu:", error)
    return NextResponse.json(
      { error: "Randevu güncellenemedi" },
      { status: 500 }
    )
  }
} 