import { prisma } from './prisma'

// Belirli bir gün için randevuları getir
export async function getAppointmentsForDay(date: Date) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  return await prisma.appointment.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: {
      date: 'asc',
    },
  })
}

// Belirli bir tarih aralığı için randevuları getir
export async function getAppointmentsForDateRange(startDate: Date, endDate: Date) {
  return await prisma.appointment.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      date: 'asc',
    },
  })
}

// Yeni randevu oluştur
export async function createAppointment(data: {
  fullname: string
  date: Date
  telefon: string
  mail: string
}) {
  return await prisma.appointment.create({
    data: {
      fullname: data.fullname,
      date: data.date,
      telefon: data.telefon,
      mail: data.mail,
    },
  })
}

// Randevu güncelle
export async function updateAppointment(
  id: number,
  data: {
    fullname?: string
    date?: Date
    telefon?: string
    mail?: string
  }
) {
  return await prisma.appointment.update({
    where: { id },
    data,
  })
}

// Randevu sil
export async function deleteAppointment(id: number) {
  return await prisma.appointment.delete({
    where: { id },
  })
} 