import { prisma } from './prisma'
import { startOfDay, endOfDay, formatDatesForApi } from './utils'

// Belirli bir gün için randevuları getir
export async function getAppointmentsForDay(date: Date | string) {
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
  
  return appointments.map(appointment => formatDatesForApi(appointment))
}

// Belirli bir tarih aralığı için randevuları getir
export async function getAppointmentsForDateRange(startDate: Date | string, endDate: Date | string) {
  const start = startOfDay(startDate)
  const end = endOfDay(endDate)
  
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
  
  return appointments.map(appointment => formatDatesForApi(appointment))
}

// Yeni randevu oluştur
export async function createAppointment(data: {
  fullname: string
  date: Date | string
  phone: string
  userId: number
}) {
  // String tipindeki tarihi Date nesnesine çevir
  const appointmentDate = typeof data.date === 'string' 
    ? new Date(data.date) 
    : data.date

  const appointment = await prisma.appointment.create({
    data: {
      fullname: data.fullname,
      date: appointmentDate,
      phone: data.phone,
      userId: data.userId,
    },
  })
  
  return formatDatesForApi(appointment)
}

// Randevu güncelle
export async function updateAppointment(
  id: string,
  data: {
    fullname?: string
    date?: Date | string
    phone?: string
    userId?: number
  }
) {
  // String tipindeki tarihi Date nesnesine çevir
  const appointmentData = { ...data }
  if (data.date && typeof data.date === 'string') {
    appointmentData.date = new Date(data.date)
  }

  const appointment = await prisma.appointment.update({
    where: { id },
    data: appointmentData,
  })
  
  return formatDatesForApi(appointment)
}

// Randevu sil
export async function deleteAppointment(id: string) {
  const appointment = await prisma.appointment.delete({
    where: { id },
  })
  
  return formatDatesForApi(appointment)
} 