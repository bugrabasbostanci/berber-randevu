import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Appointment } from '@/types'
import { format } from 'date-fns'

// Veri doğrulama fonksiyonu
const validateAppointmentData = (data: any) => {
  const errors = []
  
  if (!data.fullname) errors.push('Ad Soyad gerekli')
  if (!data.date) errors.push('Tarih gerekli')
  if (!data.phone) errors.push('Telefon gerekli')
  if (!data.barberId) errors.push('Berber seçimi gerekli')

  return errors
}

// Tüm randevuları getir
export async function GET() {
  try {
    console.log('Randevular getiriliyor...')
    
    const appointments = await prisma.appointment.findMany({
      orderBy: {
        date: 'asc'
      },
      include: {
        barber: true
      }
    })

    const formattedAppointments = appointments.map((appointment) => ({
      id: appointment.id,
      fullname: appointment.fullname,
      date: appointment.date,
      phone: appointment.phone,
      barberId: appointment.barberId,
      barberName: appointment.barber.name
    }))

    return NextResponse.json(formattedAppointments)
  } catch (error) {
    console.error('Randevular getirilirken hata:', error)
    return NextResponse.json(
      { error: 'Randevular getirilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// Yeni randevu oluştur
export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Aynı saat diliminde randevu var mı kontrol et
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        date: new Date(data.date),
        userId: data.userId
      }
    })

    if (existingAppointment) {
      return NextResponse.json(
        { error: "Bu saat diliminde zaten bir randevu var" },
        { status: 400 }
      )
    }

    const appointment = await prisma.appointment.create({
      data: {
        fullname: data.fullname,
        date: new Date(data.date),
        phone: data.phone,
        userId: data.userId
      }
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error("Randevu oluşturulurken hata oluştu:", error)
    return NextResponse.json(
      { error: "Randevu oluşturulamadı" },
      { status: 500 }
    )
  }
}

// Randevu güncelle
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    console.log('Güncelleme verisi:', body)

    if (!body.id) {
      return NextResponse.json(
        { error: 'Randevu ID\'si gerekli' },
        { status: 400 }
      )
    }

    // Veri doğrulama
    const errors = validateAppointmentData(body)
    if (errors.length > 0) {
      return NextResponse.json(
        { error: `Eksik veya hatalı bilgiler: ${errors.join(', ')}` },
        { status: 400 }
      )
    }

    // Berber kontrolü
    const barber = await prisma.barber.findUnique({
      where: { id: Number(body.barberId) }
    })

    if (!barber) {
      return NextResponse.json(
        { error: 'Geçersiz berber seçimi' },
        { status: 400 }
      )
    }

    const appointment = await prisma.appointment.update({
      where: {
        id: body.id
      },
      data: {
        fullname: body.fullname,
        date: new Date(body.date),
        phone: body.phone,
        barberId: Number(body.barberId)
      },
      include: {
        barber: true
      }
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Randevu güncellenirken hata:', error)
    return NextResponse.json(
      { error: 'Randevu güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// Randevu sil
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Randevu ID\'si gerekli' },
        { status: 400 }
      )
    }

    await prisma.appointment.delete({
      where: {
        id: parseInt(id)
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Randevu silinirken hata:', error)
    return NextResponse.json(
      { error: 'Randevu silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
} 